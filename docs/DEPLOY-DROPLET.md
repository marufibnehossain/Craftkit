# Deploy Spinkit to a DigitalOcean Droplet (with PostgreSQL on Droplet)

This guide deploys Spinkit on a Droplet with PostgreSQL installed on the same server.

---

## Prerequisites

- SSH access to your Droplet (`ssh root@YOUR_DROPLET_IP`)
- Your Spinkit code in a Git repo (GitHub, GitLab, etc.)

---

## Step 1: SSH into the Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

---

## Step 2: Set Up PostgreSQL

Clone the repo first (or upload the script), then run:

```bash
cd /var/www
git clone https://github.com/YOUR_ORG/Spinkit-Shop.git spinkit-shop
cd spinkit-shop
```

Run the database setup script with a **strong password**:

```bash
DB_PASS='YourSecurePassword123!' sudo bash scripts/droplet-setup-db.sh
```

Copy the `DATABASE_URL` and `DIRECT_URL` output — you'll need them for `.env`.

---

## Step 3: Install Node.js, PM2, and Nginx

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2
npm install -g pm2

# Nginx
apt install -y nginx
```

---

## Step 4: Create `.env` File

```bash
cd /var/www/spinkit-shop
nano .env
```

Paste and fill in (use the DATABASE_URL/DIRECT_URL from Step 2):

```env
DATABASE_URL="postgresql://spinkit:YourSecurePassword123!@localhost:5432/spinkitshop"
DIRECT_URL="postgresql://spinkit:YourSecurePassword123!@localhost:5432/spinkitshop"

NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://YOUR_DROPLET_IP"

# Email (Titan SMTP)
SMTP_HOST="smtp.titan.email"
SMTP_PORT="587"
SMTP_USER="hello@spinkit.shop"
SMTP_PASS="your-titan-password"
SMTP_FROM_EMAIL="Spinkit <hello@spinkit.shop>"
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Step 5: Build and Run Migrations

```bash
cd /var/www/spinkit-shop
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed   # Optional: seed products
npm run build
```

---

## Step 6: Start the App with PM2

```bash
pm2 start npm --name "spinkit-shop" -- start
pm2 save
pm2 startup
```

---

## Step 7: Configure Nginx

```bash
nano /etc/nginx/sites-available/spinkit-shop
```

Paste:

```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP;

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
```

Replace `YOUR_DROPLET_IP` with your Droplet IP (or your domain).

Enable and reload:

```bash
ln -s /etc/nginx/sites-available/spinkit-shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## Step 8: Update NEXTAUTH_URL

If you're using a domain, set:

```env
NEXTAUTH_URL="https://yourdomain.com"
```

Then add SSL:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## Updating the App

```bash
cd /var/www/spinkit-shop
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart spinkit-shop
```

---

## Useful Commands

| Task | Command |
|------|---------|
| View logs | `pm2 logs spinkit-shop` |
| Restart app | `pm2 restart spinkit-shop` |
| Check status | `pm2 status` |
| Database shell | `sudo -u postgres psql -d spinkitshop` |
