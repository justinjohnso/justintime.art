# Digital Ocean Droplet Deployment Guide

Complete guide for deploying Portfolio V3 on a Digital Ocean Droplet.

## 📋 Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- SSH key configured
- Git repository with your portfolio code

## 🚀 Initial Server Setup

### 1. Create Droplet

1. Log into Digital Ocean
2. Create new Droplet:
   - **Distribution**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month recommended)
   - **CPU**: Regular Intel with SSD
   - **Datacenter**: Choose closest to your audience
   - **Authentication**: SSH keys (more secure than password)
   - **Hostname**: Something memorable (e.g., `portfolio-prod`)

### 2. Connect to Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### 3. Run Setup Script

Transfer and run the automated setup script:

```bash
# Copy setup script to droplet
scp scripts/setup-droplet.sh root@YOUR_DROPLET_IP:~/

# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Run setup
chmod +x setup-droplet.sh
./setup-droplet.sh
```

The setup script installs:
- Node.js (via NVM)
- pnpm
- Nginx
- Docker & Docker Compose
- PM2 (process manager)
- Git
- UFW firewall

**Important**: After setup completes, logout and login again to use Docker without sudo.

## 🔧 Manual Configuration

### 1. Clone Repository

```bash
cd ~/portfolio-v3
git clone YOUR_REPOSITORY_URL .
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
- `PUBLIC_TINA_CLIENT_ID` - From TinaCMS dashboard
- `TINA_TOKEN` - From TinaCMS dashboard
- `NOTION_API_KEY` - From Notion integrations
- `NOTION_PROJECTS_DB_ID` - Your projects database ID
- `NOTION_BLOG_DB_ID` - Your blog database ID
- `NOTION_WEBHOOK_SECRET` - Generate with: `openssl rand -hex 32`
- `PUBLIC_SITE_URL` - Your domain or `http://YOUR_DROPLET_IP`

### 3. Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/portfolio
```

Update `server_name`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Or for IP-only:
```nginx
server_name YOUR_DROPLET_IP;
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📦 First Deployment

```bash
cd ~/portfolio-v3
./deploy.sh
```

Your site should now be live at:
- `http://YOUR_DROPLET_IP` or
- `http://yourdomain.com` (if DNS configured)

## 🔒 SSL Certificate (Recommended)

Set up free SSL with Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (requires domain pointed to droplet)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts, select "2: Redirect" for HTTP → HTTPS
```

Certbot auto-renews. Test renewal:
```bash
sudo certbot renew --dry-run
```

## 🔄 Ongoing Deployments

### Standard Deployment

```bash
cd ~/portfolio-v3
./deploy.sh
```

This will:
1. Create backup of current site
2. Pull latest code from Git
3. Install dependencies
4. Build the site
5. Deploy to Nginx
6. Reload Nginx

### Quick Deployment (Skip Build)

If you've already built locally and pushed `dist/`:

```bash
./deploy.sh --skip-build
```

### Fast Deployment (Skip Backup)

```bash
./deploy.sh --skip-backup
```

## 🔧 Common Tasks

### View Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Umami logs
cd ~/umami
docker compose logs -f
```

### Restart Services

```bash
# Nginx
sudo systemctl restart nginx

# Umami
cd ~/umami
docker compose restart

# PM2 (if using)
pm2 restart all
```

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Rollback Deployment

```bash
# List available backups
ls -lh ~/portfolio-backups/

# Rollback to specific backup
cd ~/portfolio-backups
sudo tar -xzf portfolio-backup-YYYYMMDD_HHMMSS.tar.gz -C /var/www/portfolio/
sudo chown -R www-data:www-data /var/www/portfolio
sudo systemctl reload nginx
```

## 🗄️ Database Backups (Umami)

### Manual Backup

```bash
cd ~/umami
docker compose exec postgres pg_dump -U umami umami > umami-backup-$(date +%Y%m%d).sql
```

### Restore Backup

```bash
cd ~/umami
docker compose exec -T postgres psql -U umami umami < umami-backup-YYYYMMDD.sql
```

### Automated Backups

Add to crontab:

```bash
crontab -e
```

Add line (daily backup at 2am):
```
0 2 * * * cd ~/umami && docker compose exec postgres pg_dump -U umami umami > ~/umami-backups/umami-$(date +\%Y\%m\%d).sql
```

## 📊 Monitoring

### Check Service Status

```bash
# Nginx
sudo systemctl status nginx

# Docker containers
docker ps

# Disk usage
df -h

# Memory usage
free -h
```

### Resource Monitoring

Install htop:
```bash
sudo apt install htop
htop
```

## 🔐 Security Hardening

### 1. SSH Key Only (Disable Password Auth)

```bash
sudo nano /etc/ssh/sshd_config
```

Set:
```
PasswordAuthentication no
PermitRootLogin prohibit-password
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 2. Configure UFW More Strictly

```bash
# If using Umami only locally
sudo ufw delete allow 3000

# Or allow only your IP
sudo ufw allow from YOUR_IP_ADDRESS to any port 3000
```

### 3. Set Up Fail2Ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Keep Everything Updated

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 🚨 Troubleshooting

### Site Not Loading

1. Check Nginx status: `sudo systemctl status nginx`
2. Check Nginx config: `sudo nginx -t`
3. Check error logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify files exist: `ls -la /var/www/portfolio`

### 502 Bad Gateway

- Usually means upstream service (if any) is down
- Check if you have API routes configured
- Verify port 3000 isn't being used by something else

### Umami Not Working

```bash
cd ~/umami
docker compose ps  # Check if containers are running
docker compose logs  # Check for errors
```

### Out of Disk Space

```bash
# Check usage
df -h

# Clean Docker
docker system prune -a

# Clean old deployments
rm -rf ~/portfolio-backups/portfolio-backup-202301*  # Old backups

# Clean package caches
sudo apt clean
```

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Umami Documentation](https://umami.is/docs)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Digital Ocean Community Tutorials](https://www.digitalocean.com/community/tutorials)

## 🆘 Support

If you encounter issues:

1. Check logs (Nginx, Docker, system logs)
2. Verify environment variables are set correctly
3. Ensure all services are running
4. Check firewall rules
5. Review recent changes/deployments

For emergency rollback: Use the most recent backup from `~/portfolio-backups/`
