#!/bin/bash
# Run this script on your DigitalOcean Droplet to set up PostgreSQL for Spinkit
#
# Usage:
#   DB_PASS='your_secure_password' sudo bash droplet-setup-db.sh
#
# Or edit DB_PASS below and run: sudo bash droplet-setup-db.sh

set -e

DB_NAME="spinkitshop"
DB_USER="spinkit"
DB_PASS="${DB_PASS:-}"

if [ -z "$DB_PASS" ]; then
  echo "ERROR: Set a database password first!"
  echo "Usage: DB_PASS='your_secure_password' sudo bash droplet-setup-db.sh"
  exit 1
fi

echo "=== Installing PostgreSQL ==="
apt update
apt install -y postgresql postgresql-contrib

echo "=== Creating database and user ==="
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" 2>/dev/null || echo "(User may already exist)"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || echo "(Database may already exist)"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -c "ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};"

echo ""
echo "=== Done! Add these lines to your .env file on the Droplet ==="
echo ""
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}\""
echo "DIRECT_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}\""
echo ""
