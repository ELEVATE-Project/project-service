#!/bin/bash

# Extract the Postgres connection string
POSTGRES_URL="$1"

if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Please provide the full Postgres URL as an argument."
  exit 1
fi


# Parse connection info
DB_USER=$(echo "$POSTGRES_URL" | sed -E 's|postgres://([^:]+):.*|\1|')
DB_PASSWORD=$(echo "$POSTGRES_URL" | sed -E 's|postgres://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$POSTGRES_URL" | sed -E 's|.*@([^:]+):.*|\1|')
DB_PORT=$(echo "$POSTGRES_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$POSTGRES_URL" | sed -E 's|.*/([^/?]+).*|\1|')

echo "🛠 DB Info:"
echo "Host: $DB_HOST, Port: $DB_PORT, DB: $DB_NAME, User: $DB_USER"

# Check Postgres connection
echo "🔍 Checking Postgres connection..."
if ! nc -z "$DB_HOST" "$DB_PORT"; then
  echo "❌ Cannot connect to Postgres at $DB_HOST:$DB_PORT"
  exit 1
fi
echo "✅ Postgres is reachable."

# Download the forms.json file
echo "Downloading forms.json from GitHub..."
curl -o forms.json https://raw.githubusercontent.com/ELEVATE-Project/self-creation-portal/refs/heads/sprint-5/forms.json

# Transform and generate SQL using Node.js
cat << 'EOF' > generate_forms_sql.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('forms.json', 'utf8'));

function escape(str) {
  return str ? str.replace(/'/g, "''") : null;
}

const rows = data.map(form => {
  return `INSERT INTO forms (type, sub_type, data, organization_id, version)
VALUES (
  '${escape(form.type)}',
  ${form.subType ? `'${escape(form.subType)}'` : 'NULL'},
  '${escape(JSON.stringify(form))}', -- store full form in 'data' as JSON string
  1,
  0
) ON CONFLICT DO NOTHING;`
}).join('\n');

fs.writeFileSync('/tmp/insert_forms.sql', rows);
EOF

node generate_forms_sql.js

# Execute the SQL
echo "📥 Inserting into Postgres..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "$DB_NAME" -f /tmp/insert_forms.sql

# Cleanup
rm -f forms.json generate_forms_sql.js /tmp/insert_forms.sql

echo "✅ Forms inserted successfully."