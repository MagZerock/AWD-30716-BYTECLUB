#!/bin/bash
set -e

DOMAIN="${1:-biconoirs-bussiness.duckdns.org}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Installing system dependencies ==="
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

echo "=== Installing Node.js 22 ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "=== Installing project dependencies ==="
cd "$APP_DIR"
npm install

echo "=== Setting up Prisma ==="
npx prisma generate
npx prisma db push --skip-generate

echo "=== Building Next.js ==="
npm run build

echo "=== Setting up PM2 ==="
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

pm2 delete biconoirs-bff 2>/dev/null || true
pm2 start npm --name "biconoirs-bff" -- start -- -p 3001
pm2 save

echo "=== Configuring Nginx ==="
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

cat <<'NGINX' | sudo tee /etc/nginx/sites-available/biconoirs-bff > /dev/null
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGINX

sudo sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/biconoirs-bff
sudo ln -sf /etc/nginx/sites-available/biconoirs-bff /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "=== SSL with Let's Encrypt ==="
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

echo ""
echo "=== DONE ==="
echo "BFF: https://$DOMAIN"
echo ""
echo "Verify with: curl https://$DOMAIN/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test1234\"}'"
