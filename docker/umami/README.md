# Umami Analytics

Docker Compose setup for self-hosted Umami analytics.

## Quick Start

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Generate secrets**:
   ```bash
   # APP_SECRET
   openssl rand -base64 32
   
   # POSTGRES_PASSWORD
   openssl rand -base64 24
   ```

3. **Update `.env`** with generated values

4. **Start services**:
   ```bash
   docker-compose up -d
   ```

5. **Access Umami**: http://localhost:3000
   - Username: `admin`
   - Password: `umami`
   - **Change password immediately!**

## Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update Umami
docker-compose pull
docker-compose up -d
```

## Backup

```bash
# Create backup
docker exec umami-db-1 pg_dump -U umami umami | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore backup
gunzip -c backup_20250116.sql.gz | docker exec -i umami-db-1 psql -U umami -d umami
```

## Documentation

See full setup guide: `/docs/guides/UMAMI_ANALYTICS.md`
