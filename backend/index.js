import express from "express";
import cors from "cors";
import giveWebsiteInfo from "./utils/scraper.js";
import 'dotenv/config';
import os from "os";
import cluster from "cluster";
import Crawler from "./utils/crawler.js";

if(cluster.isPrimary){
    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs - 2; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
        cluster.fork();
      });
} else {
        const app = express();
        const PORT = process.env.PORT || 5000;
        // const numCPUs = os.cpus().length;
        // console.log(numCPUs);

        app.use(express.json());
        app.use(cors());

        // Process URL and store embeddings
        app.post("/scrape", async (req, res) => {
            try {
                const { url } = req.body;
                if (!url) return res.status(400).json({ error: "URL is required" });
                const result = await giveWebsiteInfo(url);

                console.log(result);

                res.json({ message: "scraped successfully", url, result });
            } catch (error) {
                res.status(500).json({ error: "Internal Server Error", details: error.message });
            }
        });
        app.post("/crawl", async (req, res) => {
            try {
                const { url } = req.body;
                if (!url) return res.status(400).json({ error: "URL is required" });
                const result = await Crawler(url)

                console.log(result);

                res.json({ message: "scraped successfully", url, result });
            } catch (error) {
                res.status(500).json({ error: "Internal Server Error", details: error.message });
            }
        });


        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} with process id ${process.pid}`);
});
}


