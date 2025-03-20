import express from "express";
import cors from "cors";
import giveWebsiteInfo from "./utils/scraper.js";
import "dotenv/config";
import Crawler from "./utils/crawler.js";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 5000;
const scrapeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Limit each IP to 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
      error: "Too many requests, please try again after a minute."
  }
});

const crawlLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
      error: "Too many requests, please try again after a minute."
  }
});
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rj7qd65n-3000.inc1.devtunnels.ms",
    ],
  })
);

// Process URL and store embeddings
app.post("/scrape", scrapeLimiter, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const result = await giveWebsiteInfo(url);

    // console.log(result);

    res.json({ message: "scraped successfully", url, result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});
app.post("/crawl", crawlLimiter, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const result = await Crawler(url);
    // console.log(result)

    // console.log(markdown);

    res.json({ message: "scraped successfully", url, result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
