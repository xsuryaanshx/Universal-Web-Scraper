# 🚂 Railway Deployment Guide

## Quick Start (5 minutes)

### Option 1: GitHub Deploy (Recommended)

1. **Create GitHub Repo**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repos
   - Select your scraper repo
   - Click "Deploy Now"

3. **Wait for Build** (~2-3 minutes)
   - Railway detects `nixpacks.toml` automatically
   - Installs Node.js and Python
   - Installs all dependencies
   - Starts your server

4. **Get Your URL**
   - Click "Settings" → "Networking"
   - Click "Generate Domain"
   - Your app is live at: `your-app.up.railway.app`

### Option 2: Railway CLI

1. **Install CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Generate Domain**
   ```bash
   railway domain
   ```

## What Railway Does Automatically

Railway reads `nixpacks.toml` and:

1. ✅ Installs Node.js 20
2. ✅ Installs Python 3.11
3. ✅ Runs `npm install`
4. ✅ Runs `pip install -r requirements.txt`
5. ✅ Sets `PORT` environment variable
6. ✅ Starts app with `node app.js`
7. ✅ Handles SSL/HTTPS
8. ✅ Provides free domain

## Verify Deployment

### Test Health Endpoint
```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Scraper
```bash
curl -X POST https://your-app.up.railway.app/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  --output test.csv
```

### Check Logs
```bash
railway logs
```

Or in Railway dashboard:
- Go to your project
- Click "Deployments"
- Click latest deployment
- View "Deploy Logs" and "Runtime Logs"

## Monitoring

### View Logs in Real-Time
```bash
railway logs --follow
```

### Check Resource Usage
In Railway dashboard:
- Go to your project
- Click "Metrics"
- View CPU, Memory, Network usage

### Set Up Alerts
- Click "Settings" → "Notifications"
- Add webhook or email for deployment failures

## Troubleshooting

### Build Fails: "Python not found"

**Problem:** nixpacks.toml not detected

**Solution:**
```bash
# Make sure nixpacks.toml is in root directory
ls -la nixpacks.toml

# Verify content
cat nixpacks.toml
```

### Runtime Error: "Cannot find module 'express'"

**Problem:** Dependencies not installed

**Solution:**
```bash
# Check package.json is valid
cat package.json

# Redeploy
railway up --force
```

### Crash: "Address already in use"

**Problem:** Not using Railway's PORT variable

**Solution:** Already fixed in app.js:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
```

### Error: "pip: command not found"

**Problem:** Python not in nixpacks setup

**Solution:** nixpacks.toml already includes:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "python311", "python311Packages.pip"]
```

### Timeout on Large Sites

**Problem:** Scraping takes > 60 seconds

**Solution 1:** Reduce pages in `scraper.py`:
```python
MAX_PAGES = 3  # Instead of 5
```

**Solution 2:** Increase timeout in `app.js`:
```javascript
timeout: 120000  // 2 minutes
```

## Environment Variables

None required! But you can add:

### Optional: Custom Settings

```bash
# In Railway dashboard
railway variables set MAX_SCRAPE_PAGES=3
```

Then update `scraper.py`:
```python
import os
MAX_PAGES = int(os.getenv('MAX_SCRAPE_PAGES', 5))
```

## Scaling

### Free Tier Limits
- 500 hours/month
- $5 credit/month
- 1 GB RAM
- 1 vCPU

### Upgrade for:
- More concurrent requests
- Faster scraping
- Higher timeouts
- Custom domains

Click "Settings" → "Plan" to upgrade

## Custom Domain

1. Go to Railway dashboard
2. Click "Settings" → "Networking"
3. Click "Custom Domain"
4. Enter your domain: `scraper.yourdomain.com`
5. Add DNS records shown by Railway
6. Wait for DNS propagation (~1 hour)

## Database (If Needed Later)

To store scraping results:

```bash
railway add postgres
```

Then update code to use:
```javascript
process.env.DATABASE_URL
```

## Continuous Deployment

Railway auto-deploys on every `git push`:

```bash
git add .
git commit -m "Update scraper"
git push
```

Railway will:
1. Detect changes
2. Run build
3. Deploy new version
4. Zero-downtime switch

## Rollback

If deployment fails:

1. Go to "Deployments"
2. Find working deployment
3. Click "⋮" → "Redeploy"

Or via CLI:
```bash
railway rollback
```

## Cost Optimization

### Tips to Stay in Free Tier:
- ✅ Set `MAX_PAGES = 3` for faster scraping
- ✅ Add rate limiting for API abuse
- ✅ Cache results temporarily
- ✅ Monitor with `railway logs`

### Prevent Abuse:
Add to `app.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

app.use('/scrape', limiter);
```

## Backup & Export

### Download Logs
```bash
railway logs > scraper_logs.txt
```

### Export Environment
```bash
railway variables > .env.backup
```

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Test with real URLs
3. ✅ Share your scraper URL
4. 🎉 Start scraping!

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: [Your repo issues]

## Useful Commands

```bash
# View all projects
railway list

# Switch projects
railway link

# Open dashboard
railway open

# View environment
railway variables

# Shell access (debugging)
railway run bash

# Local development with Railway vars
railway run npm start
```

That's it! Your scraper is production-ready! 🚀
