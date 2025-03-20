import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import generateMarkdown from "./markd.js";
import { chunkText } from "./chunk.js";
import { Cluster } from "puppeteer-cluster";
import { autoScroll } from "./scroll.js";
import { normalizeUrl } from "./normalizeUrl.js";

puppeteer.use(StealthPlugin());

export default async function Crawler(startUrl, maxPage = 5) {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteerOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  const baseUrl = new URL(startUrl).origin;
  const visited = new Set();
  console.log("crawl function called");
  let dataArr = [];

  const staticPaths = ["/assets", "/_next", "/static", "/_", "/api"];
  const staticExtensions = [
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".map",
    ".txt",
  ];

  cluster.task(async ({ page, data: url }) => {
    try {
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (
          ["stylesheet", "font", "media", "other"].includes(
            req.resourceType()
          ) ||
          req.url().includes("cookie") ||
          req.url().includes("consent")
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      const links = await page.evaluate(
        ({ staticPaths, staticExtensions }) => {
          return Array.from(document.body.querySelectorAll("a"))
            .map((a) => a.href)
            .map((href) => href.split("#")[0])
            .map((href) => href.replace(/\/$/, ""))
            .filter(
              (href) =>
                href.startsWith(location.origin) &&
                !staticPaths.some((path) => href.includes(path)) &&
                !staticExtensions.some((ext) => href.endsWith(ext))
            );
        },
        { staticPaths, staticExtensions }
      );

      await autoScroll(page);

      const extractedData = await page.evaluate(() => {
        const title = document.title;
        // const body = document.body.innerText;
        const clonedBody = document.body.cloneNode(true);
        clonedBody
          .querySelectorAll("script, nav, svg")
          .forEach((el) => el.remove());

        // const aTag = Array.from(document.querySelectorAll("a")).map(
        //   (a) => a.href
        // );
        // const imageUrls = Array.from(document.querySelectorAll("img")).map(
        //   (img) => img.src
        // );

        return { title, html: clonedBody.outerHTML };
      });

      const chunked = chunkText(extractedData.html);
      let data = "";
      for (const chunk of chunked) {
        console.log(
          "serving chunk of size ",
          new TextEncoder().encode(chunk).length
        );
        const markdown = await generateMarkdown(chunk);
        data += markdown;
      }

      dataArr.push({ url, title: extractedData.title, markdownData: data });

      console.log("visiting", url);

      for (const link of links) {
        if (visited.size >= maxPage) break;

        const normalizedLink = normalizeUrl(link);
        if (!visited.has(normalizedLink)) {
          visited.add(normalizedLink);
          cluster.queue(normalizedLink);
        }
      }

      console.log(links);
    } catch (error) {
      console.error(`[ERROR] Failed to process URL: ${url}`);
      console.error(`Reason: ${error.message || error}`);
    }
  });

  try {
    visited.add(baseUrl);
    cluster.queue(baseUrl);
  } catch (err) {
    console.error(err.message);
  }

  await cluster.idle();
  await cluster.close();
  return dataArr;
}
