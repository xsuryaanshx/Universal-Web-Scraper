const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "../client")));

app.post("/scrape", (req, res) => {
  const url = req.body.url;

  if (!url) return res.status(400).send("No URL provided");

  console.log("Scraping:", url);

  exec(`python3 scraper/main.py "${url}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).send("Scraping failed");
    }

    console.log(stdout);

    const filePath = path.join(__dirname, "../output/data.csv");
    res.download(filePath);
  });
});

app.listen(3000, () =>
  console.log("🚀 Server running at http://localhost:3000")
);
