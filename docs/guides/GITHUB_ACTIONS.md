# GitHub Actions Workflow Guide

Complete guide for the automated Notion sync and deployment workflow.

## 🎯 Overview

The workflow automates:
1. **Syncing content** from Notion databases (projects and blog posts)
2. **Downloading images** and converting to MDX
3. **Committing changes** to the repository
4. **Building the site** with Astro
5. **Deploying** to your Digital Ocean Droplet

## 🔧 Setup

### 1. Repository Secrets

Add these secrets in GitHub repository settings:

**Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets

| Secret Name | Description | Example / How to Get |
|------------|-------------|---------------------|
| `NOTION_API_KEY` | Notion integration token | Create at: https://www.notion.so/my-integrations |
| `NOTION_PROJECTS_DB_ID` | Projects database ID | From database URL: `notion.so/[ID]?v=...` |
| `NOTION_BLOG_DB_ID` | Blog database ID | From database URL: `notion.so/[ID]?v=...` |
| `TINA_CLIENT_ID` | TinaCMS client ID | From: https://app.tina.io/ |
| `TINA_TOKEN` | TinaCMS token | From: https://app.tina.io/ |
| `PUBLIC_SITE_URL` | Your site URL | `https://yourdomain.com` |
| `PUBLIC_UMAMI_SRC` | Umami script URL | `https://yourdomain.com/analytics/script.js` |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami website ID | From Umami dashboard |
| `DROPLET_HOST` | Droplet IP address | Your Digital Ocean droplet IP |
| `DROPLET_USER` | SSH username | Usually your username (not `root`) |
| `DROPLET_SSH_KEY` | Private SSH key | Your SSH private key (see below) |

#### Generating SSH Key for Deployment

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy the private key
cat ~/.ssh/github_deploy
# → Add this as DROPLET_SSH_KEY secret (entire contents)

# Copy the public key to your droplet
ssh-copy-id -i ~/.ssh/github_deploy.pub user@YOUR_DROPLET_IP

# Test the connection
ssh -i ~/.ssh/github_deploy user@YOUR_DROPLET_IP
```

### 2. Notion Integration Setup

#### Create Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it: `Portfolio Sync`
4. Select your workspace
5. Capabilities:
   - ✅ Read content
   - ✅ Read comments
   - ✅ No user information
6. Copy the **Internal Integration Token** → `NOTION_API_KEY` secret

#### Share Databases with Integration

For each database (Projects and Blog):

1. Open database in Notion
2. Click **"..."** menu (top right)
3. Click **"Add connections"**
4. Search for and select your integration
5. Click **"Confirm"**

#### Get Database IDs

From the database URL:
```
https://notion.so/workspace/[DATABASE_ID]?v=viewid
                           ^^^^^^^^^^^
```

Copy the DATABASE_ID part for each:
- Projects → `NOTION_PROJECTS_DB_ID`
- Blog → `NOTION_BLOG_DB_ID`

### 3. Droplet Preparation

Ensure your Droplet has:
- Nginx configured (via `setup-droplet.sh`)
- Web root at `/var/www/portfolio/`
- SSH access for deployment user

## 🚀 Workflow Triggers

### 1. Notion Webhook (Automatic)

Triggered when content is published in Notion:

```bash
# Webhook URL (configure in Notion)
https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches

# Headers
Authorization: Bearer YOUR_GITHUB_TOKEN
Accept: application/vnd.github+json

# Body
{
  "event_type": "notion-update"
}
```

**Setting up the webhook:**
1. Create GitHub Personal Access Token:
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Scopes: `repo` (Full control of private repositories)
2. In Notion: Database → Automations → "When page published"
3. Add action: "Call webhook"
4. Configure webhook with above details

### 2. Manual Trigger

Run manually from GitHub Actions tab:

1. Go to **Actions** tab
2. Select **"Notion Sync & Deploy"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - Sync projects: Yes/No
   - Sync blog: Yes/No
   - Force sync: Yes/No

### 3. Scheduled Sync

Runs automatically daily at 2am UTC:
- Syncs any changes made in Notion
- Only deploys if content changed
- Keeps site in sync without manual intervention

**To disable**: Comment out the `schedule` section in `.github/workflows/notion-sync.yml`

## 📊 Workflow Steps

### Step 1: Checkout & Setup
- Checks out repository code
- Sets up Node.js 20 and pnpm
- Caches dependencies for faster runs

### Step 2: Sync from Notion
- Installs Notion client
- Runs sync script with configured flags
- Downloads images to `public/media/`
- Converts Notion blocks to MDX
- Writes files to `src/content/`

### Step 3: Check for Changes
- Uses git to detect if content changed
- If no changes: workflow stops (no deploy)
- If changes: continues to build and deploy

### Step 4: Commit Content
- Commits synced content to repository
- Includes `[skip ci]` to prevent recursive workflow triggers
- Pushes to main branch

### Step 5: Build Site
- Runs `pnpm run build`
- Uses environment variables from secrets
- Generates static site in `dist/`

### Step 6: Deploy to Droplet
- Creates backup of current deployment
- Copies new build files to Droplet
- Updates file permissions
- Reloads Nginx
- Cleans up temporary files

## 🔍 Monitoring

### View Workflow Runs

**Repository → Actions tab**

Each run shows:
- Trigger (webhook, manual, schedule)
- Duration
- Status (success, failure)
- Logs for each step

### Common Issues

#### Workflow Fails at Sync Step

**Error**: `Missing required environment variables`

**Fix**: Check that all Notion secrets are set correctly in repository settings

#### Workflow Fails at Deploy Step

**Error**: `Permission denied`

**Fix**:
1. Verify SSH key is correct (entire private key including BEGIN/END lines)
2. Check that public key is in `~/.ssh/authorized_keys` on Droplet
3. Ensure deployment user has sudo permissions

#### Content Not Updating

**Check**:
1. Is page marked as "Published" in Notion?
2. Check workflow logs for sync errors
3. Verify database is shared with Notion integration
4. Check if changes were detected (git diff step)

#### Images Not Downloading

**Error**: `Failed to download image`

**Fix**:
1. Ensure image URLs are accessible
2. Check Notion file URLs aren't expired (they expire after ~1 hour)
3. Verify `public/media/` directory exists and is writable

## 🛠️ Customization

### Change Sync Frequency

Edit `.github/workflows/notion-sync.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2am UTC
  # Change to:
  - cron: '0 */6 * * *'  # Every 6 hours
  - cron: '0 0 * * 0'    # Weekly on Sunday
```

### Sync Only Projects or Blog

Add flags to sync command:

```yaml
- name: Sync from Notion
  run: pnpm tsx scripts/sync-notion.ts --projects  # Only projects
  # or
  run: pnpm tsx scripts/sync-notion.ts --blog      # Only blog
```

### Add Notifications

Add notification step at end:

```yaml
- name: Notify Success
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ Portfolio deployed successfully!"
      }
```

### Deploy to Different Platforms

Replace Droplet deployment steps with platform-specific actions:

**Vercel:**
```yaml
- uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Netlify:**
```yaml
- uses: netlify/actions/cli@master
  with:
    args: deploy --prod
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔐 Security Best Practices

1. **Never commit secrets** to repository
2. **Use repository secrets** for all sensitive data
3. **Rotate SSH keys** periodically
4. **Limit SSH key** to deployment user (not root)
5. **Enable 2FA** on GitHub account
6. **Review workflow logs** for exposed secrets
7. **Use fine-grained PATs** when possible
8. **Restrict Notion integration** to read-only

## 🧪 Testing

### Test Locally

Before pushing workflow changes:

```bash
# Test sync script
pnpm tsx scripts/sync-notion.ts --force

# Test build
pnpm run build

# Check for errors
echo $?  # Should be 0
```

### Test Workflow Without Deploy

Comment out deployment steps temporarily:

```yaml
# - name: Deploy to Droplet
#   if: steps.check-changes.outputs.changes == 'true'
#   uses: appleboy/scp-action@v0.1.7
#   ...
```

Run workflow manually and verify sync works.

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Notion API Documentation](https://developers.notion.com/)
- [SSH Key Management](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## 💡 Tips

1. **Start with manual triggers** to test before enabling webhooks
2. **Check workflow logs** first when troubleshooting
3. **Use `--force` flag** to resync all content if needed
4. **Keep backups** of your Droplet (Digital Ocean snapshots)
5. **Monitor disk space** on Droplet (`df -h`)
6. **Review commits** to see exactly what synced
7. **Test on staging** branch before main branch changes
