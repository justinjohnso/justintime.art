# Umami Analytics Setup Guide

Self-hosted, privacy-focused analytics for the portfolio using Umami.

## Why Umami?

- **Free & Open Source**: Self-hosted, no cost
- **Privacy-First**: GDPR compliant, no cookies needed
- **Lightweight**: <2KB tracking script
- **Real-time**: Live visitor data
- **Simple**: Easy setup with Docker

## Prerequisites

- Docker and Docker Compose installed
- Digital Ocean Droplet or App Platform (for deployment)
- Domain configured (e.g., analytics.jjohnson.art or jjohnson.art/umami)

## Local Development Setup

### 1. Create Docker Compose Configuration

Create `docker/umami/docker-compose.yml`:

```yaml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${APP_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - umami-db-data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami -d umami"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  umami-db-data:
```

### 2. Create Environment File

Create `docker/umami/.env`:

```bash
# Generate with: openssl rand -base64 32
APP_SECRET=your_generated_secret_here

# Database password
POSTGRES_PASSWORD=your_secure_password_here
```

### 3. Start Umami Locally

```bash
cd docker/umami
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f umami
```

Access at: http://localhost:3000

### 4. Initial Setup

1. Login with default credentials:
   - Username: `admin`
   - Password: `umami`
2. **Change password immediately** in settings
3. Add your website:
   - Name: `jjohnson.art`
   - Domain: `jjohnson.art`
4. Copy the tracking code

## Production Deployment (Digital Ocean)

### Option A: Droplet Deployment

If using a Digital Ocean Droplet:

1. **SSH into droplet**:
```bash
ssh user@your-droplet-ip
```

2. **Create directory structure**:
```bash
mkdir -p ~/umami
cd ~/umami
```

3. **Copy configuration**:
```bash
# Upload docker-compose.yml and .env to ~/umami
scp docker/umami/docker-compose.yml user@droplet:~/umami/
scp docker/umami/.env user@droplet:~/umami/
```

4. **Start services**:
```bash
cd ~/umami
docker-compose up -d
```

5. **Configure Nginx reverse proxy** (if using Nginx):
```nginx
# In your Nginx site config
location /umami/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

6. **Reload Nginx**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

Access at: https://jjohnson.art/umami

### Option B: Separate Droplet

For dedicated analytics server:

1. Create small $4/month droplet
2. Follow same setup as Option A
3. Use subdomain: `analytics.jjohnson.art`
4. Point DNS A record to droplet IP
5. Set up SSL with Certbot

### Option C: App Platform

Digital Ocean App Platform doesn't support Docker Compose directly. Consider:
- Using managed PostgreSQL database
- Deploying Umami as a separate app
- Or stick with Droplet for simpler setup

## Adding Tracking to Site

### 1. Get Tracking Script

From Umami dashboard:
1. Go to Settings → Websites
2. Click on your website
3. Copy the tracking code

### 2. Add to Astro Layout

In `src/layouts/Layout.astro`:

```astro
---
const { title } = Astro.props;
const isProduction = import.meta.env.PROD;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <!-- ... other head content ... -->

    <!-- Umami Analytics (production only) -->
    {isProduction && (
      <script
        async
        src="https://jjohnson.art/umami/script.js"
        data-website-id="your-website-id-here"
      ></script>
    )}
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 3. Test Tracking

1. Deploy site with tracking code
2. Visit your site
3. Check Umami dashboard for real-time visitors
4. Verify events are being recorded

## Configuration

### Environment Variables

**Required**:
- `APP_SECRET` - Random string for session encryption
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PASSWORD` - Database password

**Optional**:
- `PORT` - Default: 3000
- `HOSTNAME` - Default: 0.0.0.0
- `TRACKER_SCRIPT_NAME` - Custom tracker filename
- `DISABLE_UPDATES` - Disable update checks

### Generate Secrets

```bash
# APP_SECRET
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -base64 24
```

## Features & Usage

### Dashboard Overview

- **Real-time visitors**: See live traffic
- **Pageviews**: Track page popularity
- **Referrers**: Know where visitors come from
- **Devices**: Desktop vs mobile breakdown
- **Countries**: Geographic distribution
- **Events**: Custom event tracking

### Custom Events

Track specific interactions:

```html
<!-- In your Astro component -->
<button
  data-umami-event="download-resume"
  data-umami-event-type="button"
>
  Download Resume
</button>
```

### Date Ranges

View analytics for:
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

## Maintenance

### Backup Database

```bash
# Create backup
docker exec umami-db-1 pg_dump -U umami umami | gzip > umami_backup_$(date +%Y%m%d).sql.gz

# Restore backup
gunzip -c umami_backup_20250116.sql.gz | docker exec -i umami-db-1 psql -U umami -d umami
```

### Update Umami

```bash
cd ~/umami
docker-compose pull
docker-compose up -d
```

### View Logs

```bash
# Application logs
docker-compose logs -f umami

# Database logs
docker-compose logs -f db

# All logs
docker-compose logs -f
```

### Reset Admin Password

```bash
docker exec -it umami-app-1 npm run reset -- --username admin
```

## Performance

### Resource Usage

**Umami container**:
- RAM: ~100-200MB
- CPU: Minimal (<5%)
- Storage: ~500MB (grows with data)

**PostgreSQL container**:
- RAM: ~50-100MB
- CPU: Minimal
- Storage: Depends on traffic (estimate 1GB/month for small sites)

### Optimization Tips

- Enable database connection pooling
- Set up log rotation
- Use CDN for tracking script (optional)
- Regular database vacuum (automatic in PostgreSQL)

## Security

### Best Practices

1. **Change default password immediately**
2. **Use strong APP_SECRET** (minimum 32 characters)
3. **Use strong database password**
4. **Limit database access** (localhost only)
5. **Enable HTTPS** (via Nginx/Certbot)
6. **Regular backups** (daily recommended)
7. **Keep Umami updated** (check monthly)

### Firewall Rules

If using UFW on Droplet:

```bash
# Allow Umami through reverse proxy only
# No need to expose port 3000 directly

# If using Nginx
sudo ufw allow 'Nginx Full'
```

## Troubleshooting

### Umami not starting

```bash
# Check logs
docker-compose logs umami

# Common issues:
# - APP_SECRET not set
# - Database not ready
# - Port 3000 already in use
```

### Database connection errors

```bash
# Check database status
docker-compose ps db

# Restart database
docker-compose restart db

# Reset database (CAUTION: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Tracking not working

1. Check tracking script URL is correct
2. Verify website ID matches dashboard
3. Check browser console for errors
4. Ensure script isn't blocked by ad blocker
5. Check Umami logs for incoming requests

### High resource usage

1. Check visitor volume in dashboard
2. Review database size: `docker exec umami-db-1 psql -U umami -c "\l+"`
3. Consider archiving old data
4. Upgrade droplet if needed

## Cost Breakdown

### Self-Hosted (Digital Ocean)

**Shared Droplet** (with portfolio):
- Included in $6/month droplet
- Additional storage: ~1-2GB
- **Total**: $0 extra

**Separate Droplet**:
- $4-6/month for 512MB-1GB RAM
- Sufficient for small-medium traffic
- **Total**: $4-6/month

**Managed PostgreSQL** (if using App Platform):
- Not recommended (overkill)
- $15/month minimum
- Use Droplet instead

### Comparison to Alternatives

- **Plausible**: €9/month (~$10)
- **Simple Analytics**: $19/month
- **Google Analytics**: Free but privacy concerns
- **Umami Self-Hosted**: $0-6/month

## Migration from Google Analytics

### Data Export

Google Analytics data doesn't import directly. Options:
1. Run both in parallel during transition
2. Export GA data to spreadsheets for historical reference
3. Start fresh with Umami (recommended)

### Feature Comparison

| Feature | Google Analytics | Umami |
|---------|-----------------|-------|
| Privacy | ❌ Tracks users | ✅ Anonymous |
| Setup | Complex | Simple |
| Cost | Free (with ads) | $0-6/month |
| Performance | Heavy (~50KB) | Light (~2KB) |
| Real-time | Yes | Yes |
| Custom events | Yes | Yes |
| Funnels | Yes | No |
| User flow | Yes | No |

## Resources

- [Umami Documentation](https://umami.is/docs)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Docker Hub](https://hub.docker.com/r/umami-software/umami)
- [Demo Dashboard](https://app.umami.is/share/8rmHaheU/umami.is)

## Next Steps

1. Generate secrets with OpenSSL
2. Create Docker Compose configuration
3. Test locally at localhost:3000
4. Deploy to production Droplet
5. Configure Nginx reverse proxy
6. Add tracking script to site
7. Verify events in dashboard
8. Set up automated backups
