const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("client"));

// Create output directory
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("📁 Created output directory:", outputDir);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Scrape endpoint
app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  const requestId = Date.now();

  console.log(`\n[${requestId}] 📥 New scrape request`);
  console.log(`[${requestId}] URL: ${url}`);

  // Validate URL
  if (!url) {
    console.log(`[${requestId}] ❌ No URL provided`);
    return res.status(400).json({ error: "No URL provided" });
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }
  } catch (e) {
    console.log(`[${requestId}] ❌ Invalid URL: ${e.message}`);
    return res.status(400).json({ error: "Invalid URL format. Please use http:// or https://" });
  }

  console.log(`[${requestId}] ✅ URL validated`);

  // Find Python executable
  const pythonCmd = process.env.VIRTUAL_ENV 
    ? path.join(process.env.VIRTUAL_ENV, 'bin', 'python3')
    : 'python3';

  console.log(`[${requestId}] 🐍 Using Python: ${pythonCmd}`);

  const escapedUrl = url.replace(/"/g, '\\"');
  const command = `${pythonCmd} scraper.py "${escapedUrl}"`;
  
  console.log(`[${requestId}] 🚀 Starting scraper...`);

  const child = exec(
    command,
    {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024,
      cwd: __dirname
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`[${requestId}] ❌ Scraper error:`);
        console.error(`[${requestId}] Exit code: ${error.code}`);
        console.error(`[${requestId}] Signal: ${error.signal}`);
        console.error(`[${requestId}] Stderr: ${stderr}`);
        
        // Determine error type
        if (error.killed || error.signal === 'SIGTERM') {
          return res.status(408).json({ 
            error: "Scraping timeout. The website took too long to respond. Try a smaller website or try again later." 
          });
        }

        if (stderr.includes('ModuleNotFoundError') || stderr.includes('ImportError')) {
          return res.status(500).json({ 
            error: "Server configuration error. Python dependencies are missing. Please contact administrator." 
          });
        }

        if (stderr.includes('Connection') || stderr.includes('timeout') || stderr.includes('Timeout')) {
          return res.status(500).json({ 
            error: "Cannot connect to the target website. The site may be down or blocking requests." 
          });
        }

        return res.status(500).json({ 
          error: "Scraping failed. " + (stderr || error.message).split('\n')[0]
        });
      }

      console.log(`[${requestId}] ✅ Scraper completed`);
      console.log(`[${requestId}] Output: ${stdout.trim()}`);

      const filePath = path.join(outputDir, "data.csv");

      if (!fs.existsSync(filePath)) {
        console.error(`[${requestId}] ❌ Output file not found: ${filePath}`);
        return res.status(500).json({ error: "Failed to generate output file. No data was extracted." });
      }

      const stats = fs.statSync(filePath);
      console.log(`[${requestId}] 📊 File size: ${stats.size} bytes`);

      res.download(filePath, `scraped_${requestId}.csv`, (err) => {
        if (err) {
          console.error(`[${requestId}] ❌ Download error:`, err);
          if (!res.headersSent) {
            res.status(500).json({ error: "Failed to send file" });
          }
        } else {
          console.log(`[${requestId}] ✅ File sent successfully`);
        }

        // Clean up after 5 seconds
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`[${requestId}] 🗑️ Cleaned up file`);
            }
          } catch (cleanupError) {
            console.error(`[${requestId}] ⚠️ Cleanup error:`, cleanupError.message);
          }
        }, 5000);
      });
    }
  );

  child.on("error", (err) => {
    console.error(`[${requestId}] ❌ Process error:`, err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to start scraper process. Python may not be installed correctly." 
      });
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Web Scraper Server");
  console.log("=".repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`📁 Output: ${outputDir}`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log("=".repeat(50) + "\n");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
