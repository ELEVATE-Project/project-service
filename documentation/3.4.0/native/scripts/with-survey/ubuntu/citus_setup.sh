#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- 1. ARGUMENT VALIDATION ---
if [ $# -lt 2 ]; then
    echo "Error: Folder name and database URL not provided." >&2
    echo "Usage: $0 <folder_name> <database_url>" >&2
    exit 1
fi

FOLDER_NAME="$1"
DEV_DATABASE_URL="$2"

# Check if folder exists
if [ ! -d "$FOLDER_NAME" ]; then
    echo "Error: Folder '$FOLDER_NAME' not found." >&2
    exit 1
fi

# --- 2. HIGHLY RELIABLE DATABASE URL PARSING ---
echo "Parsing database URL..."

# Remove protocol (postgres://)
DB_CLEAN_URL=$(echo "$DEV_DATABASE_URL" | sed 's/.*:\/\///')

# Extract DB_NAME
DB_NAME=$(echo "$DB_CLEAN_URL" | awk -F '/' '{print $NF}')

# Remove DB_NAME from path
HOST_PORT_PATH=$(echo "$DB_CLEAN_URL" | sed "s/\/$DB_NAME//")

# Extract components
DB_USER=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $1}')
DB_PASSWORD=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $2}')
DB_HOST=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $3}')
DB_PORT=$(echo "$HOST_PORT_PATH" | awk -F '[:@]' '{print $4}')

# Log extracted values (excluding password)
echo "Extracted Database Variables:"
echo "DB_USER: $DB_USER"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo ""

if [[ -z "$DB_PORT" ]]; then
    echo "Error: Could not extract database port. Check URL format." >&2
    exit 1
fi

# --- 3. WAIT FOR LOCAL POSTGRESQL ---

echo "Waiting for PostgreSQL on $DB_HOST:$DB_PORT to accept connections..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo -e "\nPostgreSQL is ready."

# Wait until database exists
echo "Checking existence of database '$DB_NAME'..."
until PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -p "$DB_PORT" \
    -d postgres \
    -lqt | awk '{print $1}' | grep -qw "$DB_NAME"; do
    echo -n "."
    sleep 5
done
echo -e "\nDatabase '$DB_NAME' exists."

# --- 4. CITUS EXTENSION SETUP ---

DISTRIBUTION_COLUMNS_FILE="$FOLDER_NAME/distributionColumns.sql"
if [ ! -f "$DISTRIBUTION_COLUMNS_FILE" ]; then
    echo "Error: distributionColumns.sql not found in folder '$FOLDER_NAME'." >&2
    exit 1
fi

echo "Creating Citus extension (if not exists)..."
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -p "$DB_PORT" \
    --set ON_ERROR_STOP=1 \
    -c "CREATE EXTENSION IF NOT EXISTS citus;"

# --- 5. EXECUTE SQL FILE WITH ROBUST TABLE CHECK ---

check_table() {
    local table_name=$1
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -p "$DB_PORT" \
        -q -t \
        --set ON_ERROR_STOP=1 \
        -c "SELECT 1 FROM $table_name LIMIT 1;" \
        > /dev/null 2>&1
}

echo "Starting creation of distributed tables..."

while IFS= read -r line; do
    trimmed_line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    if [[ "$trimmed_line" =~ ^create_distributed_table\(\'([^\']+)\', ]]; then
        table="${BASH_REMATCH[1]}"
        echo "Processing table: '$table'"

        # Wait until table exists
        until check_table "$table"; do
            echo "Table '$table' does not exist yet (waiting for migration)..."
            sleep 1
        done

        echo "Table '$table' exists. Applying Citus distribution..."
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -p "$DB_PORT" \
            --set ON_ERROR_STOP=1 \
            -c "$trimmed_line"
    fi
done < "$DISTRIBUTION_COLUMNS_FILE"

echo "✅ Local PostgreSQL Citus setup and table distribution completed successfully!"
