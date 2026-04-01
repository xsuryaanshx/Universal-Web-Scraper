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

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Scrape endpoint
app.post("/scrape", (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`Starting scrape for: ${url}`);

  // Execute Python scraper with timeout
  const child = exec(
    `python3 scraper.py "${url.replace(/"/g, '\\"')}"`,
    {
      timeout: 60000, // 60 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    },
    (error, stdout, stderr) => {
      if (error) {
        console.error("Scraper error:", stderr || error.message);
        
        // Handle different error types
        if (error.killed) {
          return res.status(408).json({ error: "Scraping timeout - try a smaller site" });
        }
        
        return res.status(500).json({ 
          error: "Scraping failed", 
          details: stderr || error.message 
        });
      }

      console.log("Scraper output:", stdout);

      const filePath = path.join(outputDir, "data.csv");

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(500).json({ error: "Output file not generated" });
      }

      // Send file and clean up
      res.download(filePath, "scraped_data.csv", (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        
        // Clean up file after sending (optional)
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    }
  );

  // Handle process errors
  child.on("error", (err) => {
    console.error("Process error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to start scraper process" });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Output directory: ${outputDir}`);
});
