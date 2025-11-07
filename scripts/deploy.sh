#!/bin/bash

# Load NVM and Node.js
source ~/.nvm/nvm.sh
nvm use 20

# ============================================
# Portfolio V3 - Deployment Script
# ============================================
# Run this on your Droplet to deploy updates
#
# Usage:
#   ./deploy.sh [--skip-build] [--skip-backup]

set -e  # Exit on any error

# Configuration
PROJECT_DIR=~/astro-tina-portfolio
WEB_ROOT=/var/www/portfolio
BACKUP_DIR=~/portfolio-backups
DATE=$(date +%Y%m%d_%H%M%S)

# Parse arguments
SKIP_BUILD=false
SKIP_BACKUP=false

for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
  esac
done

echo "🚀 Portfolio V3 Deployment"
echo "=========================="
echo ""

# --------------------------------------------
# 1. Navigate to project directory
# --------------------------------------------
cd $PROJECT_DIR

# --------------------------------------------
# 2. Backup current deployment (optional)
# --------------------------------------------
if [ "$SKIP_BACKUP" = false ]; then
  if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT)" ]; then
    echo "💾 Creating backup..."
    mkdir -p $BACKUP_DIR
    sudo tar -czf $BACKUP_DIR/portfolio-backup-$DATE.tar.gz -C $WEB_ROOT .
    echo "✅ Backup saved to $BACKUP_DIR/portfolio-backup-$DATE.tar.gz"

    # Keep only last 5 backups
    cd $BACKUP_DIR
    ls -t portfolio-backup-*.tar.gz | tail -n +6 | xargs -r rm --
    cd $PROJECT_DIR
  fi
else
  echo "⏭️  Skipping backup..."
fi

echo ""

# --------------------------------------------
# 3. Pull latest changes (if git repo)
# --------------------------------------------
if [ -d .git ]; then
  echo "📥 Pulling latest changes..."

  # Stash any local changes
  git stash

  # Pull from main branch
  git pull origin main

  # Apply stashed changes back (if any)
  git stash pop || true

  echo "✅ Code updated"
else
  echo "⚠️  Not a git repository, skipping pull"
fi

echo ""

# --------------------------------------------
# 4. Install dependencies
# --------------------------------------------
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Approve build scripts if needed
if ! grep -q "puppeteer" ~/.pnpm-store/.pnpmrc 2>/dev/null; then
  echo "🔧 Approving build scripts..."
  pnpm approve-builds puppeteer || true
fi
echo "✅ Dependencies installed"

echo ""

# --------------------------------------------
# 5. Build the site
# --------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  echo "🔨 Building site..."
  NODE_OPTIONS="--max-old-space-size=2048" npx tinacms build --verbose && npx astro build
  echo "✅ Build complete"
else
  echo "⏭️  Skipping build..."

  if [ ! -d "./dist" ]; then
    echo "❌ Error: No dist/ directory found and --skip-build was specified"
    exit 1
  fi
fi

echo ""

# --------------------------------------------
# 6. Deploy to Nginx
# --------------------------------------------
echo "📋 Deploying to Nginx..."

# Create web root if it doesn't exist
sudo mkdir -p $WEB_ROOT

# Remove old files
sudo rm -rf $WEB_ROOT/*

# Copy new build
sudo cp -r ./dist/* $WEB_ROOT/

# Set correct permissions
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

echo "✅ Files deployed to $WEB_ROOT"

echo ""

# --------------------------------------------
# 7. Test Nginx configuration
# --------------------------------------------
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

echo ""

# --------------------------------------------
# 8. Reload Nginx
# --------------------------------------------
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded"

echo ""

# --------------------------------------------
# 9. Restart PM2 processes (if any)
# --------------------------------------------
if command -v pm2 &> /dev/null; then
  if pm2 list | grep -q "portfolio"; then
    echo "🔄 Restarting PM2 processes..."
    pm2 restart portfolio
    echo "✅ PM2 processes restarted"
  fi
fi

echo ""

# --------------------------------------------
# 10. Show deployment status
# --------------------------------------------
echo "=========================="
echo "✅ Deployment Complete!"
echo "=========================="
echo ""
echo "📊 Deployment Info:"
echo "   Date: $DATE"
echo "   Project: $PROJECT_DIR"
echo "   Web Root: $WEB_ROOT"
if [ "$SKIP_BACKUP" = false ]; then
  echo "   Backup: $BACKUP_DIR/portfolio-backup-$DATE.tar.gz"
fi
echo ""
echo "🌐 Your site should now be live!"
echo ""

# Show git commit info if available
if [ -d .git ]; then
  echo "📝 Latest Commit:"
  git log -1 --pretty=format:"   %h - %s (%an, %ar)"
  echo ""
  echo ""
fi

echo "💡 Useful Commands:"
echo "   View Nginx logs:     sudo tail -f /var/log/nginx/access.log"
echo "   View error logs:     sudo tail -f /var/log/nginx/error.log"
echo "   Restart Nginx:       sudo systemctl restart nginx"
echo "   Rollback deployment: tar -xzf $BACKUP_DIR/portfolio-backup-$DATE.tar.gz -C $WEB_ROOT"
echo ""
