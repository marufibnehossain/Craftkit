# Deploy Spinkit to DigitalOcean

**Droplet:** `142.93.36.112`
**Site:** http://142.93.36.112

---

## Step 1: Push your code (on your computer)

Close any Git UI in Cursor, then run:

```powershell
cd "d:\My Projects\Cursor\Spinkit-Shop"
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "Deploy: Spinkit, Titan SMTP, receipt PDF, query filters"
git push origin main
```

---

## Step 2: SSH into the Droplet

```bash
ssh root@142.93.36.112
```

Enter your Droplet password when prompted.

---

## Step 3: Clone repo and create .env

```bash
cd /var/www
git clone https://github.com/marufibnehossain/Spinkit-Shop.git spinkit-shop
cd spinkit-shop
nano .env
```

Paste your `.env` content (from your local project). **Update these lines:**

```
NEXTAUTH_URL="http://142.93.36.112"
NEXT_PUBLIC_SITE_URL="http://142.93.36.112"
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Step 4: Run the deploy script

```bash
cd /var/www/spinkit-shop
bash scripts/deploy-to-droplet.sh
```

---

## Step 5: Visit the site

Open **http://142.93.36.112** in your browser.

---

## Update after code changes

```bash
ssh root@142.93.36.112
cd /var/www/spinkit-shop
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart spinkit
```
