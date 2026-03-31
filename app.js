const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

app.post("/scrape", (req, res) => {
  const url = req.body.url;

  if (!url) return res.status(400).send("No URL provided");

  exec(`python3 scraper.py "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).send("Scraping failed");
    }

    const filePath = path.join(outputDir, "data.csv");

    if (!fs.existsSync(filePath)) {
      return res.status(500).send("File not generated");
    }

    res.download(filePath);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
