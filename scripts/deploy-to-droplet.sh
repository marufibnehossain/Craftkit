#!/bin/bash
# Run this script ON THE DROPLET after SSH in
# Usage: bash deploy-to-droplet.sh

set -e
DROPLET_IP="142.93.36.112"

echo "=== Spinkit deployment to $DROPLET_IP ==="

# Install Node, PM2, Nginx if not present
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt update && apt install -y nodejs
fi

if ! command -v pm2 &>/dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

if ! command -v nginx &>/dev/null; then
  echo "Installing Nginx..."
  apt update && apt install -y nginx
fi

# Clone or pull
cd /var/www
if [ -d "spinkit-shop" ]; then
  echo "Pulling latest..."
  cd spinkit-shop
  git pull origin main
else
  echo "Cloning repo..."
  git clone https://github.com/marufibnehossain/Spinkit-Shop.git spinkit-shop
  cd spinkit-shop
fi

# Check .env exists
if [ ! -f .env ]; then
  echo ""
  echo "ERROR: .env file not found!"
  echo "Create it with: nano .env"
  echo "Copy from your local .env and set:"
  echo "  NEXTAUTH_URL=\"http://$DROPLET_IP\""
  echo "  NEXT_PUBLIC_SITE_URL=\"http://$DROPLET_IP\""
  exit 1
fi

echo "Building..."
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

echo "Starting with PM2..."
pm2 delete spinkit 2>/dev/null || true
pm2 start npm --name "spinkit" -- start
pm2 save
pm2 startup 2>/dev/null || true

# Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/spinkit << 'NGINX'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/spinkit /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "=== Done! Visit http://$DROPLET_IP ==="
