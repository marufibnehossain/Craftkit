#!/bin/bash
# Craftkit → DigitalOcean deploy script
# Usage: bash deploy.sh

set -e
DROPLET="root@167.99.83.57"
APP_DIR="/var/www/craftkit"

echo "==> Syncing files..."
tar -czf /tmp/craftkit-deploy.tar.gz \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./.git' \
  --exclude='./.local' \
  --exclude='*.log' \
  -C /home/runner/workspace .

scp -o StrictHostKeyChecking=no /tmp/craftkit-deploy.tar.gz $DROPLET:/tmp/

echo "==> Extracting on droplet..."
ssh -o StrictHostKeyChecking=no $DROPLET "cd $APP_DIR && tar -xzf /tmp/craftkit-deploy.tar.gz && rm /tmp/craftkit-deploy.tar.gz"

echo "==> Installing dependencies..."
ssh -o StrictHostKeyChecking=no $DROPLET "cd $APP_DIR && npm install --production=false"

echo "==> Syncing database schema..."
ssh -o StrictHostKeyChecking=no $DROPLET "cd $APP_DIR && npx prisma db push"

echo "==> Building..."
ssh -o StrictHostKeyChecking=no $DROPLET "cd $APP_DIR && npm run build"

echo "==> Restarting app..."
ssh -o StrictHostKeyChecking=no $DROPLET "pm2 restart craftkit"

echo ""
echo "Deployed to https://craftkit.store"
