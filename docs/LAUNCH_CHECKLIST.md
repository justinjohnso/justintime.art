# 🚀 Launch Checklist

Complete guide to take the portfolio from current state to live production site.

## ✅ Current Status

**Infrastructure Complete:**
- ✅ Astro + TinaCMS setup
- ✅ Blog structure and pages
- ✅ Project pages and content
- ✅ Icon system (Lucide React)
- ✅ Video embed utilities
- ✅ Notion sync script
- ✅ GitHub Actions workflow
- ✅ Deployment scripts
- ✅ Environment configuration
- ✅ Documentation

**What's Left:** Content finalization, dependency installation, deployment configuration, going live.

---

## 📋 Pre-Launch Tasks

### 1. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Approve necessary build scripts
pnpm approve-builds puppeteer

# This will install:
# - @notionhq/client v5.2.0 (Notion API)
# - puppeteer v24.25.0 (PDF generation)
# - tsx v4.20.6 (TypeScript execution)
# - All other project dependencies
```

### 2. Content Finalization

**Projects:**
- [ ] Review all project descriptions
- [ ] Add/update project images
- [ ] Verify all external links work
- [ ] Test video embeds
- [ ] Set featured projects

**About Page:**
- [ ] Add personal photo
- [ ] Finalize bio text
- [ ] Verify social media links
- [ ] Add any additional sections

**Blog:**
- [ ] Review existing blog posts (if migrating from old site)
- [ ] Write welcome/first post
- [ ] Test blog post layouts
- [ ] Verify category system

### 3. Configuration

**Create `.env` file:**

```bash
cp .env.example .env
```

**Fill in required values:**

```bash
# TinaCMS (from https://app.tina.io/)
NEXT_PUBLIC_TINA_CLIENT_ID=your-client-id
TINA_TOKEN=your-token
NEXT_PUBLIC_TINA_BRANCH=main

# Notion (from https://notion.so/my-integrations)
NOTION_API_KEY=secret_your-integration-token
NOTION_PROJECTS_DB_ID=your-projects-database-id
NOTION_BLOG_DB_ID=your-blog-database-id
NOTION_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Site
PUBLIC_SITE_URL=https://jjohnson.art

# Analytics (after Umami setup)
PUBLIC_UMAMI_SRC=https://jjohnson.art/analytics/script.js
PUBLIC_UMAMI_WEBSITE_ID=your-website-id
```

### 4. Local Testing

```bash
# Test development build
pnpm dev

# Test production build
pnpm build
pnpm preview

# Test Notion sync (if configured)
pnpm sync:notion --force

# Check for errors
pnpm astro check
```

**Manual testing checklist:**
- [ ] Homepage loads and looks good
- [ ] All project pages accessible
- [ ] Blog index and posts work
- [ ] About page displays correctly
- [ ] Navigation works everywhere
- [ ] Mobile responsive on all pages
- [ ] Images load properly
- [ ] External links open in new tabs
- [ ] 404 page works

---

## 🌐 Deployment

### Option A: Digital Ocean Droplet (Recommended)

**1. Create Droplet**
- Log into Digital Ocean
- Create Ubuntu 22.04 LTS droplet ($6/month or cheaper)
- Add your SSH key
- Note the IP address

**2. Run Setup Script**

```bash
# Copy setup script to droplet
scp scripts/setup-droplet.sh root@YOUR_DROPLET_IP:~/

# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Run setup (installs Node, pnpm, Nginx, Docker, etc.)
chmod +x setup-droplet.sh
./setup-droplet.sh

# Logout and login again (for Docker permissions)
exit
ssh YOUR_USER@YOUR_DROPLET_IP
```

**3. Clone Repository**

```bash
cd ~/portfolio-v3
git clone YOUR_REPOSITORY_URL .
```

**4. Configure Environment**

```bash
cp .env.example .env
nano .env
# Fill in all production values
```

**5. Start Umami Analytics**

```bash
cd ~/umami
# Edit docker-compose.yml with secure passwords
nano docker-compose.yml
docker compose up -d

# Access at http://YOUR_DROPLET_IP:3000
# Default login: admin / umami
# Change password immediately!
```

**6. First Deployment**

```bash
cd ~/portfolio-v3
./deploy.sh
```

**7. Configure Domain**

In your domain registrar (e.g., Namecheap):
- Add A record: `@` → `YOUR_DROPLET_IP`
- Add A record: `www` → `YOUR_DROPLET_IP`

**8. Update Nginx for Domain**

```bash
sudo nano /etc/nginx/sites-available/portfolio
# Change server_name to your domain
# server_name jjohnson.art www.jjohnson.art;

sudo nginx -t
sudo systemctl reload nginx
```

**9. Setup SSL Certificate**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d jjohnson.art -d www.jjohnson.art
# Follow prompts, select redirect option
```

**10. Configure GitHub Actions**

In GitHub repository settings → Secrets and variables → Actions, add:

| Secret Name | Value |
|------------|-------|
| `NOTION_API_KEY` | Your Notion integration token |
| `NOTION_PROJECTS_DB_ID` | Projects database ID |
| `NOTION_BLOG_DB_ID` | Blog database ID |
| `TINA_CLIENT_ID` | TinaCMS client ID |
| `TINA_TOKEN` | TinaCMS token |
| `PUBLIC_SITE_URL` | https://jjohnson.art |
| `PUBLIC_UMAMI_SRC` | Your Umami script URL |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami website ID |
| `DROPLET_HOST` | Your droplet IP |
| `DROPLET_USER` | Your SSH username |
| `DROPLET_SSH_KEY` | Your SSH private key |

**11. Test Automated Deployment**

- Make a small change (e.g., update README)
- Commit and push to main branch
- Check GitHub Actions tab for workflow run
- Or trigger manually: Actions → Notion Sync & Deploy → Run workflow

---

### Option B: Vercel/Netlify (Quick Start)

**Vercel:**
```bash
pnpm add -g vercel
vercel login
vercel

# Add environment variables in Vercel dashboard
# Note: Limited to static site only (no API routes)
```

**Netlify:**
```bash
pnpm add -g netlify-cli
netlify login
netlify init

# Add environment variables in Netlify dashboard
```

⚠️ **Note:** These platforms have limitations for Notion sync and PDF generation due to function timeouts. Droplet recommended for full functionality.

---

## 🔧 Post-Launch

### 1. Configure Notion Webhook (Optional)

For automatic updates when you publish in Notion:

1. In Notion database → Automations
2. Trigger: "When page published"
3. Action: "Call webhook"
4. URL: `https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches`
5. Headers:
   ```
   Authorization: Bearer YOUR_GITHUB_PAT
   Accept: application/vnd.github+json
   ```
6. Body:
   ```json
   {
     "event_type": "notion-update"
   }
   ```

### 2. Setup Monitoring

**Umami Analytics:**
- Access at `https://jjohnson.art/analytics`
- Review visitor stats weekly
- Track popular projects

**Uptime Monitoring:**
- Consider UptimeRobot (free)
- Ping site every 5 minutes
- Get alerts if down

**Error Monitoring:**
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Review GitHub Actions failures
- Monitor disk space: `df -h`

### 3. Regular Maintenance

**Weekly:**
- [ ] Review analytics
- [ ] Check site is accessible
- [ ] Publish new blog post (if schedule allows)

**Monthly:**
- [ ] Update dependencies: `pnpm update`
- [ ] Review and delete old backups
- [ ] Check disk space on Droplet
- [ ] Review and update content

**Quarterly:**
- [ ] Review and update about page
- [ ] Audit project showcase
- [ ] Check all external links
- [ ] Update resume/CV

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
pnpm astro check

# Clear cache and rebuild
rm -rf .astro dist node_modules
pnpm install
pnpm approve-builds puppeteer
pnpm build
```

### Peer Dependency Warnings

Some peer dependency warnings from TinaCMS packages are expected and can be ignored:
- Warnings about `typescript` version mismatches with typedoc
- Warnings about `yup` version mismatches
- Warnings about `fs-extra` version mismatches

These don't affect functionality and are due to TinaCMS internal dependencies.

### Deployment Fails

```bash
# SSH into droplet and check logs
ssh your-user@your-droplet-ip
sudo tail -f /var/log/nginx/error.log

# Check if Nginx is running
sudo systemctl status nginx

# Restart if needed
sudo systemctl restart nginx
```

### Notion Sync Issues

```bash
# Test sync locally first
pnpm sync:notion

# Check environment variables are set
cat .env | grep NOTION

# Verify Notion database is shared with integration
```

### GitHub Actions Fails

- Check Actions tab for specific error
- Verify all secrets are set correctly
- Check if Droplet is accessible via SSH
- Review workflow logs for details

---

## ✨ Success Criteria

Your site is ready when:

- ✅ Site loads at your custom domain (https://jjohnson.art)
- ✅ All projects display correctly
- ✅ Blog posts are accessible
- ✅ About page is complete
- ✅ Analytics tracking works
- ✅ Mobile responsive on all devices
- ✅ SSL certificate is active (HTTPS)
- ✅ 404 page works for bad URLs
- ✅ Notion sync works (optional, can enable later)
- ✅ Content updates deploy automatically (optional)

---

## 📚 Quick Reference

**Common Commands:**

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Notion Sync
pnpm sync:notion           # Sync all content
pnpm sync:projects         # Sync only projects
pnpm sync:blog            # Sync only blog

# Deployment
./deploy.sh               # Deploy to Droplet
./deploy.sh --skip-backup # Deploy without backup
```

**Important Files:**

- `.env` - Environment variables (never commit!)
- `astro.config.mjs` - Astro configuration
- `tina/config.ts` - TinaCMS configuration
- `scripts/deploy.sh` - Deployment automation
- `scripts/sync-notion.ts` - Notion sync script

**Documentation:**

- [Droplet Deployment Guide](./guides/DROPLET_DEPLOYMENT.md)
- [GitHub Actions Guide](./guides/GITHUB_ACTIONS.md)
- [Nginx Configuration](./guides/NGINX_CONFIGURATION.md)
- [Notion Schema](./planning/NOTION_SCHEMA_MAPPING.md)

---

## 🎉 Next Steps After Launch

1. Share your site on social media
2. Update LinkedIn/resume with new portfolio URL
3. Submit to portfolio directories
4. Write a blog post about the build process
5. Start planning new projects to showcase

**Your site is production-ready. Time to ship! 🚀**
