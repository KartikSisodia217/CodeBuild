#!/bin/bash
set -e

# Change to the root directory where alembic.ini is located
cd /app

echo "Waiting for postgres..."
while ! curl http://db:5432/ 2>&1 | grep '52' > /dev/null; do
  sleep 1
done
echo "PostgreSQL started"

echo "Running Alembic Migrations..."
alembic upgrade head

echo "Seeding default data..."
python -m backend.scripts.init_db

echo "Starting Uvicorn Server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
