
#!/bin/sh
set -e

# Ensure the data directory exists (handled by volume, but good to check)
# Running migrations
echo "Running database migrations..."

echo $DATABASE_URL

npx prisma@5.22.0 migrate deploy

echo "Starting server..."
node server.js
