#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- 1. ARGUMENT VALIDATION ---
if [ $# -lt 2 ]; then
    echo "Error: Folder name and database URL not provided." >&2
    echo "Usage: $0 <folder_name> <database_url>" >&2
    exit 1
fi

# Use the provided folder name
FOLDER_NAME="$1"
DEV_DATABASE_URL="$2"

# Check if folder exists
if [ ! -d "$FOLDER_NAME" ]; then
    echo "Error: Folder '$FOLDER_NAME' not found." >&2
    exit 1
fi

# --- 2. HIGHLY RELIABLE DATABASE URL PARSING ---
echo "Parsing database URL..."

# Remove the protocol part (e.g., 'postgres://')
DB_CLEAN_URL=$(echo "$DEV_DATABASE_URL" | sed 's/.*:\/\///')

# 1. Extract DB_NAME (last part after the final slash)
DB_NAME=$(echo "$DB_CLEAN_URL" | awk -F '/' '{print $NF}')
# 2. Extract HOST and PORT (remove DB_NAME and the preceding slash)
HOST_PORT_PATH=$(echo "$DB_CLEAN_URL" | sed "s/\/$DB_NAME//")

# 3. Use standard ':' and '@' delimiters on the remaining string
DB_USER=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $1}')
DB_PASSWORD=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $2}')
DB_HOST=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $3}')
DB_PORT=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $4}')

# Define the container name (assumes container name is the DB_HOST, which is 'citus_master')
CONTAINER_NAME="$DB_HOST"

# Log database variables (excluding password)
echo "Extracted Database Variables:"
echo "DB_USER: $DB_USER"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo ""

# Check the extracted port
if [[ -z "$DB_PORT" ]]; then
    echo "Error: Could not extract database port. Check URL format." >&2
    exit 1
fi

# --- 3. WAIT FOR CONTAINER AND DATABASE ---

# Wait for Docker container to be up
echo "Waiting for Docker container '$CONTAINER_NAME' to be up..."
until docker inspect "$CONTAINER_NAME" &>/dev/null; do
    echo -n "."
    sleep 1
done
echo -e "\nContainer is now up."

# Wait for PostgreSQL to be ready to accept connections
# Use DB_USER for the check, as it must be a valid user
echo "Waiting for PostgreSQL on '$DB_HOST:$DB_PORT' to accept connections..."
until docker exec "$CONTAINER_NAME" bash -c "pg_isready -h localhost -p $DB_PORT -U $DB_USER > /dev/null 2>&1"; do
    echo -n "."
    sleep 1
done
echo -e "\nDatabase server is ready."

# Check and wait for the target database to exist
echo "Checking existence of database '$DB_NAME'..."
until docker exec "$CONTAINER_NAME" bash -c "PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d postgres -p $DB_PORT -lqt | grep -qw '$DB_NAME'"; do
    echo -n "."
    sleep 5
done
echo -e "\nDatabase '$DB_NAME' exists, proceeding with script."

# --- 4. CITUS EXTENSION SETUP ---

DISTRIBUTION_COLUMNS_FILE="$FOLDER_NAME/distributionColumns.sql"
if [ ! -f "$DISTRIBUTION_COLUMNS_FILE" ]; then
    echo "Error: distributionColumns.sql not found in folder '$FOLDER_NAME'." >&2
    exit 1
fi

echo "Copying distributionColumns.sql to container '$CONTAINER_NAME'..."
CONTAINER_SQL_PATH="/tmp/distributionColumns.sql"
docker cp "$DISTRIBUTION_COLUMNS_FILE" "$CONTAINER_NAME:$CONTAINER_SQL_PATH"

echo "Creating Citus extension in the database..."
docker exec "$CONTAINER_NAME" bash -c "PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d $DB_NAME -p $DB_PORT --set ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS citus;'"

# --- 5. EXECUTE SQL FILE WITH ROBUST TABLE CHECK ---

check_table() {
    local table_name=$1
    # Check if we can select from the table. If we can't, it returns non-zero.
    docker exec "$CONTAINER_NAME" bash -c "PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d $DB_NAME -p $DB_PORT -q -t --set ON_ERROR_STOP=1 -c \"SELECT 1 FROM $table_name LIMIT 1;\"" > /dev/null 2>&1
}

echo "Starting creation of distributed tables..."
docker exec "$CONTAINER_NAME" bash -c "cat $CONTAINER_SQL_PATH" | while IFS= read -r line; do
    trimmed_line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    if [[ "$trimmed_line" =~ ^create_distributed_table\(\'([^\']+)\', ]]; then
        table="${BASH_REMATCH[1]}"
        echo "Processing table: '$table'"
        
        # Robust wait loop for the table to be created by the preceding process (e.g., migration)
        until check_table "$table"; do
            echo "Table '$table' does not exist yet (waiting for migration to finish)..."
            sleep 1
        done
        
        echo "Table '$table' exists. Executing Citus distribution command..."
        docker exec "$CONTAINER_NAME" bash -c "PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d $DB_NAME -p $DB_PORT --set ON_ERROR_STOP=1 -c \"$trimmed_line\""
    fi
done

# Clean up temporary file in the container
docker exec "$CONTAINER_NAME" rm "$CONTAINER_SQL_PATH"

echo "✅ Citus extension setup and distribution columns complete successfully!"