#!/bin/bash

# ============================================
# Portfolio V3 - Droplet Setup Script
# ============================================
# Run this script on a fresh Digital Ocean Droplet
# Ubuntu 22.04 LTS recommended
#
# Usage:
#   chmod +x setup-droplet.sh
#   ./setup-droplet.sh

set -e  # Exit on any error

echo "🚀 Starting Portfolio V3 Droplet Setup..."
echo "=========================================="

# --------------------------------------------
# 1. System Updates
# --------------------------------------------
echo ""
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# --------------------------------------------
# 2. Install Node.js via NVM
# --------------------------------------------
echo ""
echo "📦 Installing Node.js via NVM..."

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS
nvm install --lts
nvm use --lts

echo "✅ Node.js $(node -v) installed"

# --------------------------------------------
# 3. Install pnpm
# --------------------------------------------
echo ""
echo "📦 Installing pnpm..."
npm install -g pnpm
echo "✅ pnpm $(pnpm -v) installed"

# --------------------------------------------
# 4. Install Nginx
# --------------------------------------------
echo ""
echo "📦 Installing Nginx..."
sudo apt install -y nginx

echo "✅ Nginx installed"

# --------------------------------------------
# 5. Install Docker & Docker Compose
# --------------------------------------------
echo ""
echo "📦 Installing Docker..."

# Add Docker's official GPG key
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

echo "✅ Docker installed (logout and login again to use docker without sudo)"

# --------------------------------------------
# 6. Install PM2 (Process Manager)
# --------------------------------------------
echo ""
echo "📦 Installing PM2..."
npm install -g pm2

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME

echo "✅ PM2 installed"

# --------------------------------------------
# 7. Install Git
# --------------------------------------------
echo ""
echo "📦 Installing Git..."
sudo apt install -y git
echo "✅ Git installed"

# --------------------------------------------
# 8. Create Application Directory
# --------------------------------------------
echo ""
echo "📁 Creating application directory..."
mkdir -p ~/portfolio-v3
echo "✅ Directory created at ~/portfolio-v3"

# --------------------------------------------
# 9. Configure Firewall (UFW)
# --------------------------------------------
echo ""
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
echo "✅ Firewall configured (SSH, HTTP, HTTPS allowed)"

# --------------------------------------------
# 10. Generate Deployment Script
# --------------------------------------------
echo ""
echo "📝 Creating deployment script..."

cat > ~/deploy-portfolio.sh << 'DEPLOY_EOF'
#!/bin/bash

# Portfolio V3 Deployment Script
# Usage: ./deploy-portfolio.sh

set -e

echo "🚀 Deploying Portfolio V3..."

# Navigate to project directory
cd ~/portfolio-v3

# Pull latest changes (if git repo)
if [ -d .git ]; then
  echo "📥 Pulling latest changes..."
  git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the site
echo "🔨 Building site..."
pnpm run build

# Restart services if using PM2
if pm2 list | grep -q "portfolio"; then
  echo "🔄 Restarting PM2 process..."
  pm2 restart portfolio
fi

# Copy build to Nginx directory
echo "📋 Copying build to Nginx..."
sudo rm -rf /var/www/portfolio/*
sudo cp -r ./dist/* /var/www/portfolio/
sudo chown -R www-data:www-data /var/www/portfolio

echo "✅ Deployment complete!"
DEPLOY_EOF

chmod +x ~/deploy-portfolio.sh
echo "✅ Deployment script created at ~/deploy-portfolio.sh"

# --------------------------------------------
# 11. Create Nginx Site Configuration
# --------------------------------------------
echo ""
echo "📝 Creating Nginx configuration..."

sudo mkdir -p /var/www/portfolio

sudo tee /etc/nginx/sites-available/portfolio > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain

    root /var/www/portfolio;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API endpoints (if using SSR or API routes)
    # Uncomment if you add API routes
    # location /api/ {
    #     proxy_pass http://localhost:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    # }
}
NGINX_EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ Nginx configured and reloaded"

# --------------------------------------------
# 12. Setup Docker for Umami Analytics
# --------------------------------------------
echo ""
echo "📝 Creating Docker Compose configuration for Umami..."

mkdir -p ~/umami
cat > ~/umami/docker-compose.yml << 'DOCKER_EOF'
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@postgres:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${APP_SECRET:-replace-with-random-string}
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-umami}
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    restart: always

volumes:
  umami-db-data:
DOCKER_EOF

echo "✅ Docker Compose file created at ~/umami/docker-compose.yml"
echo "   Edit this file to set secure passwords!"

# --------------------------------------------
# 13. Final Instructions
# --------------------------------------------
echo ""
echo "=========================================="
echo "✅ Droplet setup complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Logout and login again to use Docker without sudo:"
echo "   logout"
echo ""
echo "2. Clone your repository:"
echo "   cd ~/portfolio-v3"
echo "   git clone <your-repo-url> ."
echo ""
echo "3. Create .env file with your secrets:"
echo "   nano ~/portfolio-v3/.env"
echo "   (Copy from .env.example and fill in values)"
echo ""
echo "4. Start Umami analytics:"
echo "   cd ~/umami"
echo "   # Edit docker-compose.yml to set secure passwords"
echo "   docker compose up -d"
echo ""
echo "5. Deploy your site:"
echo "   cd ~/portfolio-v3"
echo "   pnpm approve-builds puppeteer"
echo "   ./scripts/deploy.sh"
echo ""
echo "6. (Optional) Setup SSL with Certbot:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "📚 Documentation:"
echo "   - Nginx config: /etc/nginx/sites-available/portfolio"
echo "   - Deployment script: ~/deploy-portfolio.sh"
echo "   - Umami: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🔐 Security Reminders:"
echo "   - Change default passwords in ~/umami/docker-compose.yml"
echo "   - Generate secure NOTION_WEBHOOK_SECRET: openssl rand -hex 32"
echo "   - Setup SSH key authentication and disable password login"
echo "   - Keep system packages updated: sudo apt update && sudo apt upgrade"
echo ""
