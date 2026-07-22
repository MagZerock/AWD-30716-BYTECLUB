#!/bin/bash
set -e

DOMAIN="${1:-biconoirs-business.duckdns.org}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Installing system dependencies ==="
sudo dnf update -y
sudo dnf install -y nginx certbot python3-certbot-nginx

echo "=== Installing Node.js 22 ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
  sudo dnf install -y nodejs
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

echo "=== Configuring Initial Nginx (HTTP only for Certbot) ==="
# En Amazon Linux las configuraciones van en /etc/nginx/conf.d/
sudo rm -f /etc/nginx/conf.d/*.conf

cat <<NGINX | sudo tee /etc/nginx/conf.d/biconoirs-bff.conf > /dev/null
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGINX

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "=== Requesting SSL Certificate with Certbot ==="
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect

echo ""
echo "=== DONE ==="
echo "BFF: https://$DOMAIN"
echo ""
echo "Verify with: curl https://$DOMAIN/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test1234\"}'"