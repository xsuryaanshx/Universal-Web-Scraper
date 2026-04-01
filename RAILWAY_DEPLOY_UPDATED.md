# 🚂 Railway Deployment Guide - UPDATED FOR RAILPACK

## ⚠️ Railway Changed Their Build System!

Railway now uses **Railpack** instead of Nixpacks. I've added the correct config files.

## 🚀 Deploy to Railway (Updated)

### Option 1: GitHub Deploy (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - **IMPORTANT:** Railway will auto-detect the configuration

3. **If you see "No start command detected":**
   - Go to your project settings
   - Click "Settings" tab
   - Scroll to "Build & Deploy"
   - Set **Custom Start Command:** `node app.js`
   - Click "Deploy"

4. **Get Your URL:**
   - Click "Settings" → "Networking"
   - Click "Generate Domain"
   - Your app is live!

### Option 2: Force Nixpacks Builder

If Railpack gives issues, force Nixpacks:

1. In Railway dashboard, go to your project
2. Click "Settings"
3. Under "Build & Deploy", find "Builder"
4. Select **"NIXPACKS"** from dropdown
5. Click "Redeploy"

### Option 3: Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway init

# Set builder to Nixpacks
railway variables set RAILWAY_BUILDER=NIXPACKS

# Deploy
railway up
```

## 📁 Config Files (All Included)

I've created **4 config files** to ensure compatibility:

1. **railway.json** - Primary Railpack config
2. **railway.toml** - Alternative format
3. **nixpacks.toml** - Original Nixpacks config
4. **Procfile** - Fallback start command

Railway will automatically use the right one!

## ✅ Verify Deployment

### 1. Check Logs
```bash
railway logs
```

Look for:
```
✅ Server running on port 3000
📁 Output directory: /app/output
```

### 2. Test Health Endpoint
```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 3. Test Scraper
```bash
curl -X POST https://your-app.up.railway.app/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  --output test.csv
```

## 🐛 Troubleshooting

### Error: "No start command detected"

**Solution 1 - Manual Start Command:**
1. Go to Railway dashboard
2. Click "Settings"
3. Find "Custom Start Command"
4. Enter: `node app.js`
5. Click "Deploy"

**Solution 2 - Use railway.json:**
The `railway.json` file should fix this automatically. If not:
```bash
# Verify file exists
ls -la railway.json railway.toml Procfile

# Commit and push again
git add railway.json railway.toml Procfile
git commit -m "Add Railway configs"
git push
```

**Solution 3 - Force Nixpacks:**
Add environment variable in Railway:
```
RAILWAY_BUILDER=NIXPACKS
```

### Error: "Python not found"

**Solution:**
1. Check `nixpacks.toml` exists
2. In Railway Settings, set Builder to "NIXPACKS"
3. Redeploy

### Error: "Module 'express' not found"

**Solution:**
```bash
# Make sure package.json exists
cat package.json

# Check node_modules in logs
railway logs | grep "npm install"

# Force clean build
railway variables set RAILWAY_CLEAN_BUILD=true
railway up
```

### Error: "Port binding failed"

**Solution:**
Already fixed! App uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
```

Railway sets this automatically.

### Error: Build succeeds but app crashes

**Check logs:**
```bash
railway logs --follow
```

Common causes:
1. Missing Python dependencies → Check `requirements.txt`
2. Missing output directory → Already created in `app.js`
3. Python not in PATH → Use Nixpacks builder

## 🎯 Best Deployment Method

**Recommended Steps:**

1. Push all files to GitHub
2. Deploy via Railway GitHub integration
3. If Railpack fails, switch to Nixpacks builder in settings
4. Set custom start command: `node app.js`
5. Verify with health check

## 📊 Railway Settings to Configure

### In Railway Dashboard:

**Build Settings:**
- Builder: `NIXPACKS` (if Railpack fails)
- Install Command: (leave blank - auto-detected)
- Build Command: (leave blank - auto-detected)
- Start Command: `node app.js`

**Environment Variables:**
- `PORT` - (auto-set by Railway)
- Optional: `MAX_SCRAPE_PAGES=5`
- Optional: `NODE_ENV=production`

**Networking:**
- Generate Domain: Yes
- Custom Domain: (optional)

## 🔄 Redeploy After Changes

```bash
git add .
git commit -m "Update scraper"
git push

# Railway auto-deploys on push
# Watch logs:
railway logs --follow
```

## 💡 Pro Tips

1. **Always check logs first:**
   ```bash
   railway logs | tail -50
   ```

2. **Use Nixpacks if Railpack fails:**
   - More reliable for hybrid Node/Python apps
   - Better documented
   - More control

3. **Test locally before deploying:**
   ```bash
   npm install
   pip install -r requirements.txt
   npm start
   ```

4. **Monitor your app:**
   - Add health check monitoring
   - Check Railway metrics dashboard
   - Set up deployment notifications

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Nixpacks Docs: https://nixpacks.com
- Railway Discord: https://discord.gg/railway

## ✅ Deployment Checklist

- [ ] All config files committed (railway.json, nixpacks.toml, Procfile)
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Builder set (Railpack or Nixpacks)
- [ ] Start command configured: `node app.js`
- [ ] Domain generated
- [ ] Health check passes
- [ ] Test scrape works
- [ ] Logs show no errors

Your scraper is ready! 🚀
