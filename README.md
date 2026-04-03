# 🌐 Universal Web Scraper v2

A beautiful, production-ready web scraper with a modern UI and robust backend.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.x-green)
![Python](https://img.shields.io/badge/python-3.11-blue)

## ✨ What's New in V2

### 🎨 Completely Redesigned UI
- **Modern dark theme** with gradient accents
- **Animated background** and smooth transitions
- **Real-time progress** with status updates
- **Responsive design** - works perfectly on mobile
- **Custom fonts** (Outfit + JetBrains Mono)
- **Better UX** with clear error messages

### 🔧 Backend Improvements
- **Enhanced error handling** with specific error types
- **Better logging** with request IDs and timestamps
- **Improved Python detection** (works with venv)
- **Detailed error messages** for debugging
- **Graceful shutdown** handling
- **Health endpoint** with system info

### 🐛 Bug Fixes
- ✅ Fixed 500 Internal Server Error
- ✅ Fixed hard-coded backend URL (now uses relative paths)
- ✅ Fixed missing `client/` directory issue
- ✅ Fixed pip installation on Railway
- ✅ Added proper timeout handling
- ✅ Improved connection error detection

## 🚀 Quick Deploy to Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Deploy web scraper v2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects configuration ✅
6. Wait 2-3 minutes for deployment

### 3. Generate Domain
1. Click "Settings" → "Networking"
2. Click "Generate Domain"
3. Your scraper is live! 🎉

## 🧪 Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health

# Test scraping
curl -X POST https://your-app.up.railway.app/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  --output test.csv
```

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm

### Installation
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start server
npm start

# Open browser
open http://localhost:3000
```

## 📁 Project Structure

```
scraper-v2/
├── app.js              # Express backend with enhanced logging
├── scraper.py          # Python scraper (robust + validated)
├── client/
│   └── index.html      # Beautiful modern UI
├── package.json        # Node dependencies
├── requirements.txt    # Python dependencies  
├── nixpacks.toml       # Railway build config
├── railway.json        # Railway deployment config
├── Procfile            # Process file
└── .gitignore         # Git ignore rules
```

## 🎯 Features

- ✅ Extracts headings, paragraphs, lists, and tables
- ✅ Crawls up to 5 pages per website
- ✅ 60-second timeout protection
- ✅ Same-domain crawling only
- ✅ Polite crawling (0.5s delay)
- ✅ Clean CSV output
- ✅ Auto-cleanup after download
- ✅ Mobile-responsive UI
- ✅ Real-time progress updates
- ✅ Detailed error messages

## 🐛 Troubleshooting

### "Cannot connect to server"
**Problem:** Frontend can't reach backend  
**Solution:** Make sure backend is running. Check Railway logs.

### "Scraping failed" with Python error
**Problem:** Python dependencies missing  
**Solution:** Verify `requirements.txt` is deployed. Check Railway build logs.

### "Timeout" errors
**Problem:** Website takes too long  
**Solution:** Reduce `MAX_PAGES` in `scraper.py` or increase timeout in `app.js`

### Still getting 500 errors?
Check Railway logs:
```bash
railway logs --follow
```

Look for:
- Python import errors
- Missing dependencies
- Permission issues
- Path problems

## ⚙️ Configuration

### Adjust scraping limits

**scraper.py:**
```python
MAX_PAGES = 5        # Number of pages to crawl
REQUEST_DELAY = 0.5  # Delay between requests (seconds)
```

**app.js:**
```javascript
timeout: 60000  // Request timeout (milliseconds)
```

## 📊 API Endpoints

### POST /scrape
Scrape a website and return CSV

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:** CSV file download

**Errors:**
- `400` - Invalid URL
- `408` - Timeout
- `500` - Scraping failed

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "memory": {...}
}
```

## 🎨 UI Features

- **Dark theme** optimized for readability
- **Gradient accents** for visual interest
- **Animated background** with subtle pulse
- **Floating logo** with smooth animation
- **Progress indicator** with status messages
- **Status alerts** with color-coded feedback
- **Responsive layout** for all screen sizes
- **Keyboard shortcuts** (Enter to submit)
- **Auto-focus** on page load

## 🔒 Security

- ✅ URL validation and sanitization
- ✅ Command injection prevention
- ✅ Same-domain enforcement
- ✅ File extension blocking
- ✅ Request timeouts
- ✅ CORS enabled

## 📈 Performance

- Fast scraping (typically 5-15 seconds)
- Efficient CSV generation
- Auto file cleanup
- 10MB buffer limit
- Concurrent request handling

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

MIT

## 🙏 Credits

Built with:
- Express.js
- Python 3
- BeautifulSoup4
- Pandas
- Railway

---

**Need help?** Check Railway logs or create an issue on GitHub.
