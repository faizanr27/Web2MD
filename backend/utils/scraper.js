import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Cluster } from 'puppeteer-cluster';
import os from 'os';
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
// import {createClient} from "redis";
import validUrl from "is-url";
import fs from 'fs/promises'

puppeteer.use(StealthPlugin());

const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);
const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// const redisClient = createClient({
//     url: process.env.REDIS_URL,
//   });

//   await redisClient.connect();

let cluster;

async function initializeCluster() {
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: os.cpus().length,
    puppeteer,
    puppeteerOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  cluster.task(async ({ page, data: url }) => {
    if (!validUrl(url)) {
        throw new Error("Invalid URL");
      }

    try {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (
          ["stylesheet", "font", "media", "other"].includes(req.resourceType()) ||
          req.url().includes("cookie") ||
          req.url().includes("consent")
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });

      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight / 2);
      });

      const extractedData = await page.evaluate(() => {

        const title = document.title;
        const body = document.body.innerText;
        const imageUrls = Array.from(document.querySelectorAll("img")).map(
          (img) => img.src
        );

        return { title, body, imageUrls };

      });

      const markdown = await generateMarkdown(extractedData);
      const cachedData = JSON.stringify({ markdown, title: extractedData.title });
      // await redisClient.setEx(url, 86400, cachedData);
      await fs.writeFile("mark.txt", markdown)
      return { markdown, title: extractedData.title  };

    } catch (error) {
      console.error("Error:", error.message);
      return { error: error.message };
    } finally {
      if (page) {
        try {
          if (page && !page.isClosed()) await page.close();
        } catch (err) {
          console.error("❌ Error closing page:", err.message);
        }
      }
    }
  });
}

await initializeCluster().catch((err) => console.error("Cluster initialization failed:", err));

async function scrapeWithCheerio(url) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      const title = $("title").text();
      const body = $("body").text();
      const imageUrls = $("img").map((_, img) => $(img).attr("src")).get();

      const extractedData = {result: { title, body, imageUrls }};
      return await generateMarkdown(extractedData);
    } catch (error) {
      console.error("Cheerio scraping failed:", error);
      return "Error extracting data";
    }
  }

async function generateMarkdown(data) {
    const textContent = `${data.title}\n\n${data.body}\n\n${data.imageUrls}`;
    const prompt = `You are an AI assistant that converts webpage content to markdown while filtering out unnecessary information. Please follow these guidelines:
    Remove any inappropriate content, ads, or irrelevant information
    If unsure about including something, err on the side of keeping it
    Answer in English. Include all points in markdown in sufficient detail and image links if any to be useful.
    Aim for clean, readable markdown.
    Return the markdown and nothing else.
    Input: ${textContent}
    Output:\`\`\`markdown\n `;

    try {

    const result = await model1.generateContent(prompt);
    console.log(result.response.candidates[0].content)
      return result.response.candidates[0]?.content.parts[0]?.text || "No summary found";
    } catch (error) {
      console.error("AI summarization failed:", error);
      return "Error generating markdown";
    }
  }

  async function giveWebsiteInfo(url) {
    try {
      console.log('scraper function')
      if (!validUrl(url)) {
        return { error: "Invalid URL" };
      }

      // const cachedData = await redisClient.get(url);
      // if (cachedData) {
      //   console.log("Returning cached data");
      //   return JSON.parse(cachedData);;
      // }

      // If Puppeteer fails, fallback to Cheerio
      try {
        return await cluster.execute(url);
      } catch (error) {
        console.error("Puppeteer failed, falling back to Cheerio");
        return await scrapeWithCheerio(url);
      }

    } catch (error) {
      console.error("Error in giveWebsiteInfo:", error);
      return { error: error.message };
    }
  }


  process.on("SIGINT", async () => {
    console.log("🔴 Gracefully shutting down...");
    await cluster.idle();
    await cluster.close();
    await redisClient.disconnect();
    process.exit(0);
  });

  process.on("exit", async () => {
    if (cluster) {
      await cluster.idle();
      await cluster.close();
    }
    if (redisClient) {
      await redisClient.disconnect();
    }
  });

export default giveWebsiteInfo;
