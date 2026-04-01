# 🌐 Universal Web Scraper

A full-stack web scraper that extracts content from any website and exports it to CSV format.

## Features

- 🚀 Fast and efficient web scraping
- 📊 Exports data to CSV format
- 🎯 Extracts headings, paragraphs, and lists
- 🔄 Crawls up to 5 pages per request
- ⚡ Built with Express.js + Python
- 🎨 Clean, modern UI
- 🛡️ Error handling and timeouts

## Tech Stack

**Backend:**
- Node.js + Express
- Python 3.11
- BeautifulSoup4
- Pandas

**Frontend:**
- Vanilla HTML/CSS/JS

## Local Development

### Prerequisites
- Node.js 16+ 
- Python 3.11+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
pip install -r requirements.txt
```

2. Start the server:
```bash
npm start
```

3. Open browser to `http://localhost:3000`

## 🚂 Deploy to Railway

### Method 1: Via GitHub (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the configuration

3. **Environment Setup:**
   - Railway automatically uses `nixpacks.toml` for build
   - No environment variables needed by default

### Method 2: Via Railway CLI

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Login and deploy:**
```bash
railway login
railway init
railway up
```

3. **Get your URL:**
```bash
railway domain
```

## Railway Configuration Explained

The `nixpacks.toml` file tells Railway how to build your app:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "python311", "python311Packages.pip"]
```
- Installs Node.js 20 and Python 3.11

```toml
[phases.install]
cmds = [
  "npm install --production",
  "pip install --no-cache-dir -r requirements.txt"
]
```
- Installs Node and Python dependencies

```toml
[start]
cmd = "node app.js"
```
- Starts the Express server

## Debugging Common Issues

### Issue: "Python not found"
**Solution:** Make sure `nixpacks.toml` includes Python in setup phase

### Issue: "Module not found"
**Solution:** Check that both `package.json` and `requirements.txt` list all dependencies

### Issue: "Port binding error"
**Solution:** App uses `process.env.PORT` - Railway sets this automatically

### Issue: "Timeout errors"
**Solution:** Increase timeout in `app.js` or reduce `MAX_PAGES` in `scraper.py`

### Issue: "CORS errors"
**Solution:** CORS is enabled by default. If using custom domain, update CORS settings in `app.js`

## API Endpoints

### POST /scrape
Scrapes a website and returns CSV file

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
- 200: CSV file download
- 400: Invalid URL
- 408: Timeout
- 500: Scraping error

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Key Fixes from Original Code

1. ✅ **URL Validation**: Added proper URL validation and sanitization
2. ✅ **Error Handling**: Comprehensive error handling in both Node and Python
3. ✅ **Timeouts**: 60-second timeout to prevent hanging requests
4. ✅ **Domain Filtering**: Only crawls same-domain links
5. ✅ **File Cleanup**: Auto-deletes CSV files after download
6. ✅ **Better Scraping**: Extracts more content types (h1-h3, p, li, td)
7. ✅ **Rate Limiting**: 0.5s delay between requests (polite crawling)
8. ✅ **Better UI**: Modern, responsive interface with status updates
9. ✅ **Health Endpoint**: Monitor server status
10. ✅ **Production Ready**: Proper dependency versions and security

## Configuration

### Adjust scraping limits:

In `scraper.py`:
```python
MAX_PAGES = 5  # Number of pages to crawl
REQUEST_DELAY = 0.5  # Delay between requests (seconds)
```

In `app.js`:
```javascript
timeout: 60000  // Timeout in milliseconds
```

## License

MIT

## Support

For issues, open a GitHub issue or check Railway logs:
```bash
railway logs
```
