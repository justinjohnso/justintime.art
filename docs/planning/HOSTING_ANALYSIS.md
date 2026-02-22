# Hosting Decision Analysis

**Date**: October 15, 2025
**Final Decision**: Digital Ocean App Platform

---

## Requirements Analysis

### Critical Requirements
1. **Webhook endpoints** for Notion integration
2. **Long-running processes** for PDF generation (Puppeteer)
3. **Bi-directional sync** back to Notion
4. **Weekly blog updates** = 4-8 builds/month minimum
5. **No tight timeout restrictions** for serverless functions
6. **Cost-effective** for personal portfolio

### Build Frequency Estimate
- **Projects**: 1-2 updates/month
- **Blog posts**: 4 posts/month (weekly)
- **Total deployments**: 5-10/month
- **Build time estimate**: 2-5 minutes per build
- **Monthly build minutes**: 25-50 minutes minimum

---

## Option 1: Vercel (Free Tier)

### Pros
✅ Excellent Astro support
✅ Automatic deployments from GitHub
✅ Easy setup and configuration
✅ Edge network included
✅ Preview deployments

### Cons
❌ **10-second function timeout** (critical blocker)
❌ Limited to 100GB bandwidth/month
❌ 50MB function size limit

### Why Rejected
**The 10-second timeout is a dealbreaker** for:
- PDF generation with Puppeteer (typically 15-30 seconds)
- Complex Notion sync operations
- Image processing if needed

**Cost**: Free, but limitations too restrictive

**Verdict**: ❌ Not suitable for this project

---

## Option 2: Netlify (Free Tier)

### Pros
✅ Good build system
✅ 300 build minutes/month
✅ Webhook support
✅ Form handling built-in
✅ Preview deployments

### Cons
❌ **300 build minutes runs out quickly**
   - 5 min/build × 8 builds = 40 minutes
   - Only 7.5x headroom
   - One complex build could consume 20+ minutes
❌ **10-second background function timeout**
❌ **1 concurrent build** (causes queuing)
❌ 26-second max for synchronous functions (still limiting)

### Why Rejected
**Build minutes will be exhausted** with:
- Weekly blog updates
- Any build failures requiring rebuilds
- Complex Astro builds (especially with image optimization)

**PDF generation still problematic** even with 26-second sync timeout.

**Cost**: Free, but too restrictive

**Verdict**: ❌ Not suitable for weekly updates

---

## Option 3: Cloudflare Pages + Workers

### Pros
✅ Unlimited bandwidth
✅ 500 builds/month (plenty)
✅ Excellent global performance
✅ Built-in DDoS protection
✅ 100,000 function requests/day

### Cons
❌ **10ms CPU time on free tier** (severely limiting)
❌ Workers require separate paid plan for reasonable limits
❌ More complex architecture (Pages + Workers split)
❌ Learning curve for Workers vs traditional Node.js
❌ Puppeteer difficult to run in Workers

### Cost Analysis
- **Pages**: Free
- **Workers**: $5/month for 10M requests + more CPU time
- **Total**: $5/month

### Why Considered
Could work, but:
- More complexity than needed
- Workers environment is restrictive
- Puppeteer PDF generation challenging
- Split architecture complicates development

**Verdict**: 🟡 Possible but not ideal

---

## Option 4: Digital Ocean App Platform (SELECTED ⭐)

### Pros
✅ **No timeout limits** on API endpoints
✅ **No build minute restrictions**
✅ **Full Node.js environment** (Puppeteer works perfectly)
✅ Automatic deployments from GitHub
✅ Built-in SSL certificates
✅ Environment variable management
✅ Logs and monitoring included
✅ Can run background jobs
✅ Simple Express.js API routes
✅ Scales easily if needed

### Cons
⚠️ Not free ($5/month for Basic tier)
⚠️ Less "edge" distribution than Vercel/Cloudflare
⚠️ Slightly more setup than Vercel/Netlify

### Cost Analysis
- **Base cost**: $5/month for Basic tier
- **GitHub Student Pack**: $200 credit
- **Coverage**: 40 months of hosting (~3.3 years)
- **Effective cost**: $0 for duration of degree + 1 year

### Why Selected
1. **GitHub Student Pack makes it effectively free**
2. **No artificial limitations** on functions or builds
3. **Perfect for Puppeteer** PDF generation
4. **Ideal for webhook endpoints** with complex logic
5. **Can handle bi-directional Notion sync** without timeouts
6. **Room to grow** if traffic increases
7. **Simpler architecture** than Cloudflare Workers
8. **Full control** over infrastructure

**Verdict**: ✅ **Best fit for all requirements**

---

## Option 5: Digital Ocean Droplet

### Pros
✅ **Complete control** (full VPS)
✅ **$4-6/month** (even cheaper than App Platform)
✅ Can run multiple services
✅ Ultimate flexibility

### Cons
❌ **More DevOps work** (server management, updates, security)
❌ Need to configure web server, PM2, etc.
❌ Manual SSL certificate management
❌ More complexity than needed

### When To Consider
- App Platform hits limitations (unlikely)
- Need to run additional services (databases, cron jobs)
- Want to self-host analytics (Umami)

**Verdict**: 🟡 Good backup option, overkill for now

---

## Selected Architecture

### Hosting: Digital Ocean App Platform

**Setup**:
```yaml
name: portfolio
region: nyc
services:
  - name: web
    github:
      repo: justinjohnso/nextjs-portfolio
      branch: main
    build_command: pnpm install && pnpm build
    run_command: node server.js  # Express server for webhooks
    environment_slug: node-js
    instance_size_slug: basic
    http_port: 3000
    routes:
      - path: /
```

**Components**:
1. **Static site** (Astro build output)
2. **Express API** for webhook endpoints:
   - `/api/notion-webhook` - Triggers rebuild on Notion updates
   - `/api/generate-pdf` - Generates project one-sheets
3. **Environment variables** for Notion, TinaCMS
4. **Automatic deploys** on git push

### Why This Works

#### For Notion Sync
- Webhook receives Notion update
- API validates request
- Syncs content to git repository
- Triggers Astro rebuild
- **No timeout issues** - can take 30+ seconds if needed

#### For PDF Generation
- Webhook receives generate request
- Spins up Puppeteer
- Renders HTML template with Notion data
- Generates PDF (can take 20-30 seconds)
- Uploads to DO Spaces
- Returns URL
- **No timeout constraints**

#### For Blog Updates
- Weekly posts = ~4 builds/month
- Each build: 2-5 minutes
- Total: 8-20 minutes/month
- **No build minute limits** - unlimited builds

---

## Cost Breakdown

### Year 1-3 (with Student Pack)
- **Hosting**: $0 (Student Pack credit)
- **Domain**: Already owned
- **Analytics**: $0 (self-hosted Umami)
- **Media storage**: $0-5/month (DO Spaces or Cloudinary free)
- **Total**: $0-5/month

### After Student Pack
- **Hosting**: $5/month
- **Analytics**: $0 (self-hosted) or €9/month (Plausible)
- **Media storage**: $5/month (DO Spaces grows with usage)
- **Total**: $10-19/month

---

## Alternative Scenarios

### If Traffic Explodes
- Upgrade to Professional tier ($12/month)
- Add CDN (Cloudflare free in front of DO)
- Consider edge caching

### If Budget Becomes Issue
- Move to Droplet ($6/month)
- Self-host everything
- Use Cloudflare for CDN

### If Need More Features
- App Platform supports:
  - Databases (PostgreSQL add-on)
  - Redis (for caching)
  - Multiple services
  - Custom domains
  - Team collaboration

---

## Deployment Strategy

### Phase 1: Initial Setup
1. Create DO App Platform app
2. Connect GitHub repo
3. Configure build settings
4. Set environment variables
5. Deploy static site

### Phase 2: API Endpoints
1. Add Express.js server
2. Create webhook endpoints
3. Test with Notion
4. Add authentication

### Phase 3: PDF Generation
1. Install Puppeteer
2. Create PDF templates
3. Set up storage (DO Spaces)
4. Test end-to-end

### Phase 4: Domain & SSL
1. Point justintime.art to DO
2. Configure SSL (automatic)
3. Test custom domain

### Phase 5: Analytics
1. Deploy Umami container
2. Add tracking script
3. Configure dashboard

---

## Monitoring & Maintenance

### Built-in DO Features
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, bandwidth usage
- **Alerts**: Email/Slack notifications
- **Health checks**: Automatic restart on failure

### Recommended Additions
- **Uptime monitoring**: UptimeRobot (free)
- **Error tracking**: Sentry (free tier)
- **Performance**: Lighthouse CI in GitHub Actions

---

## Conclusion

**Digital Ocean App Platform is the clear winner** because:

1. ✅ GitHub Student Pack provides 40 months free hosting
2. ✅ No artificial limitations on functions or builds
3. ✅ Perfect for Puppeteer PDF generation
4. ✅ Ideal for complex webhook logic
5. ✅ Handles weekly blog updates without build minute concerns
6. ✅ Simple architecture - no need for Workers/Functions split
7. ✅ Room to grow with traffic
8. ✅ Full control when needed

The decision to reject Vercel and Netlify came down to:
- **Function timeouts too restrictive** for PDF generation
- **Build minutes insufficient** for weekly blog updates
- **Artificial limitations** that would cause problems down the road

**Risk**: Minimal - Student Pack covers costs for years, and fallback to Droplet is straightforward.

**Recommendation**: Proceed with Digital Ocean App Platform.
