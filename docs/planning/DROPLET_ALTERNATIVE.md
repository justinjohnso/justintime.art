# Digital Ocean Droplet - Alternative Setup

> **Note**: This is an alternative approach to the selected [Digital Ocean App Platform](../PROJECT_ROADMAP.md#priority-2-hosting--deployment) solution. This guide is preserved for reference and as a fallback option if needs change.

Complete all-in-one hosting solution for portfolio with Notion sync, analytics, and PDF generation.

**Cost**: $6/month = 33+ months with GitHub Student Pack credit

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  Digital Ocean Droplet ($6/month)           │
│  Ubuntu 24.04, 1GB RAM, 25GB SSD            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Nginx (Web Server)                 │   │
│  │  ├── Static site (Astro build)     │   │
│  │  ├── SSL (Let's Encrypt)           │   │
│  │  └── Reverse proxy to APIs         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Node.js API (PM2)                  │   │
│  │  ├── /api/notion-webhook           │   │
│  │  ├── /api/generate-pdf              │   │
│  │  └── /api/generate-resume           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Umami Analytics (Docker)           │   │
│  │  └── PostgreSQL (Docker)            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Filesystem Storage                 │   │
│  │  ├── /var/www/portfolio/public/    │   │
│  │  │   └── media/                     │   │
│  │  └── /var/www/portfolio/pdfs/      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Initial Server Setup

### 1. Create Droplet

```bash
# On Digital Ocean dashboard:
1. Create Droplet
2. Choose: Ubuntu 24.04 LTS
3. Plan: Basic ($6/month - 1GB RAM, 25GB SSD)
4. Datacenter: New York or San Francisco (closest to you)
5. Authentication: SSH key (add your public key)
6. Enable backups: Optional ($1.20/month extra)
7. Apply Student Pack credit
```

### 2. Initial Security Hardening

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser justin
usermod -aG sudo justin

# Copy SSH keys to new user
rsync --archive --chown=justin:justin ~/.ssh /home/justin

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Disable root SSH login
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
systemctl restart sshd

# Exit and reconnect as new user
exit
ssh justin@your_droplet_ip
```

### 3. Install Dependencies

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Install Nginx
sudo apt install -y nginx

# Install Docker & Docker Compose
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## Application Deployment

### 1. Clone and Build Portfolio

```bash
# Clone repository
cd ~
git clone https://github.com/justinjohnso/nextjs-portfolio.git portfolio
cd portfolio

# Install dependencies
pnpm install

# Create production .env
nano .env.production
# Add:
# NOTION_API_KEY=your_key
# TINA_TOKEN=your_token
# PUBLIC_TINA_CLIENT_ID=your_client_id
# WEBHOOK_SECRET=generate_random_secret

# Build site
pnpm build

# Deploy build to web directory
sudo mkdir -p /var/www/portfolio
sudo cp -r dist/* /var/www/portfolio/
sudo chown -R www-data:www-data /var/www/portfolio

# Create media directories
sudo mkdir -p /var/www/portfolio/public/media
sudo mkdir -p /var/www/portfolio/pdfs
sudo chown -R www-data:www-data /var/www/portfolio/public
sudo chown -R justin:justin /var/www/portfolio/pdfs
```

### 2. Set Up API Server

```bash
# Create API server directory
mkdir ~/portfolio-api
cd ~/portfolio-api

# Initialize Node project
pnpm init

# Install dependencies
pnpm add express @notionhq/client puppeteer dotenv cors helmet

# Create server.js
nano server.js
```

**server.js**:
```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Webhook endpoints
app.post('/api/notion-webhook', async (req, res) => {
  // Verify webhook secret
  const signature = req.headers['x-webhook-signature'];
  if (signature !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // TODO: Implement sync logic
  res.json({ success: true });
});

app.post('/api/generate-pdf', async (req, res) => {
  // TODO: Implement PDF generation
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'portfolio-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start API server with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command that PM2 outputs
```

### 3. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/portfolio
```

**Nginx Configuration**:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhooks:10m rate=5r/m;

# Upstream for API
upstream portfolio_api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name jjohnson.art www.jjohnson.art;

    root /var/www/portfolio;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Media files with long cache
    location /media/ {
        alias /var/www/portfolio/public/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PDF files
    location /pdfs/ {
        alias /var/www/portfolio/pdfs/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://portfolio_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook endpoints (stricter rate limiting)
    location /api/notion-webhook {
        limit_req zone=webhooks burst=2 nodelay;
        proxy_pass http://portfolio_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Disable logging for favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Disable logging for robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Set Up SSL (Let's Encrypt)

```bash
# Obtain SSL certificate
sudo certbot --nginx -d jjohnson.art -d www.jjohnson.art

# Certificate will auto-renew
# Test renewal:
sudo certbot renew --dry-run
```

---

## Umami Analytics Setup

### 1. Create Docker Compose Configuration

```bash
mkdir ~/umami
cd ~/umami
nano docker-compose.yml
```

**docker-compose.yml**:
```yaml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${APP_SECRET}
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    restart: always

volumes:
  umami-db-data:
```

```bash
# Generate app secret
openssl rand -base64 32

# Create .env file
nano .env
# Add:
# APP_SECRET=your_generated_secret

# Start Umami
docker-compose up -d

# Check status
docker-compose ps
```

### 2. Configure Umami in Nginx

Add to Nginx config:
```nginx
# Umami analytics
location /umami/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Configure Umami

1. Access: https://jjohnson.art/umami
2. Login: admin / umami
3. Change password immediately
4. Add website: jjohnson.art
5. Copy tracking code
6. Add to Astro layout

---

## Deployment Workflow

### Manual Deploy

```bash
# On local machine
git push origin main

# On server
cd ~/portfolio
git pull
pnpm install
pnpm build
sudo rm -rf /var/www/portfolio/*
sudo cp -r dist/* /var/www/portfolio/
sudo chown -R www-data:www-data /var/www/portfolio

# If API changed
cd ~/portfolio-api
git pull
pnpm install
pm2 restart portfolio-api
```

### Automated Deploy (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Droplet

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          PUBLIC_TINA_CLIENT_ID: ${{ secrets.PUBLIC_TINA_CLIENT_ID }}

      - name: Deploy to Droplet
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: justin
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/tmp/portfolio"

      - name: Restart services
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: justin
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            sudo rm -rf /var/www/portfolio/*
            sudo cp -r /tmp/portfolio/dist/* /var/www/portfolio/
            sudo chown -R www-data:www-data /var/www/portfolio
            rm -rf /tmp/portfolio
```

---

## Backup Strategy

### 1. Automated Backups

```bash
# Create backup script
nano ~/backup.sh
```

**backup.sh**:
```bash
#!/bin/bash
BACKUP_DIR="/home/justin/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup site files
tar -czf $BACKUP_DIR/portfolio_$DATE.tar.gz /var/www/portfolio

# Backup Umami database
docker exec umami-db-1 pg_dump -U umami umami | gzip > $BACKUP_DIR/umami_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "portfolio_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "umami_*.sql.gz" -mtime +7 -delete

# Optional: Upload to DigitalOcean Spaces or S3
# aws s3 sync $BACKUP_DIR s3://your-bucket/backups/
```

```bash
chmod +x ~/backup.sh

# Schedule daily backups
crontab -e
# Add:
0 2 * * * /home/justin/backup.sh
```

### 2. Digital Ocean Snapshots

Enable automated snapshots in DO dashboard for weekly full server backups ($1.20/month).

---

## Monitoring & Maintenance

### 1. Server Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop netdata

# Netdata provides web dashboard
sudo systemctl start netdata
sudo systemctl enable netdata

# Access at: http://your_ip:19999
```

### 2. Log Management

```bash
# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View API logs
pm2 logs portfolio-api

# View Umami logs
docker-compose logs -f umami

# Rotate logs
sudo nano /etc/logrotate.d/portfolio
```

### 3. Security Updates

```bash
# Create update script
nano ~/update.sh
```

**update.sh**:
```bash
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

# Restart services if needed
if [ -f /var/run/reboot-required ]; then
    echo "Reboot required"
    # sudo reboot
fi
```

```bash
chmod +x ~/update.sh

# Schedule weekly updates
crontab -e
# Add:
0 3 * * 0 /home/justin/update.sh
```

---

## Cost Analysis

### Monthly Costs
- **Droplet**: $6/month
- **Backups** (optional): $1.20/month
- **Total**: $6-7/month

### With Student Pack
- **Credit**: $200
- **Coverage**: 28-33 months (~2.5-3 years)
- **Effective monthly cost**: $0

### Comparison to App Platform
- **App Platform**: $5/month
- **Spaces (storage)**: $5/month
- **Umami Droplet**: $4-6/month
- **Total**: $14-16/month vs. $6/month
- **Savings**: $8-10/month

---

## Pros & Cons

### Pros ✅
- **All-in-one**: Everything on single server
- **Cost-effective**: $6/month total
- **Full control**: SSH access, custom config
- **No object storage**: Just use filesystem
- **Simpler billing**: One bill instead of multiple services
- **Learning opportunity**: Hands-on DevOps experience

### Cons ❌
- **More setup**: Nginx, SSL, PM2, Docker
- **Manual scaling**: No automatic scaling
- **Single point of failure**: (mitigated with backups)
- **Maintenance**: Need to handle updates, security
- **No automatic deployments**: (can add GitHub Actions)

---

## Recommendation

**Use Droplet if**:
- You want full control
- You're comfortable with basic DevOps
- You want to minimize costs
- You want everything in one place
- Low traffic (< 100k pageviews/month)

**Use App Platform if**:
- You want zero DevOps
- You need automatic scaling
- You expect high traffic
- You prefer managed services

**For your use case (personal portfolio, low traffic, Student Pack credit)**: **Droplet is ideal**. The savings and simplicity of having everything in one place outweigh the extra setup effort.
