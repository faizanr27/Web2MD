import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import generateMarkdown from './markd.js';
import { chunkText } from "./chunk.js";
import { Cluster } from 'puppeteer-cluster';
import { autoScroll } from "./scroll.js";
import { normalizeUrl } from "./normalizeUrl.js";


puppeteer.use(StealthPlugin());

async function Crawler(startUrl, maxPages = 8) {
  console.log("crawl function called")
  let dataArr = []
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Extract the base URL to ensure links stay within the same domain
  const baseUrl = new URL(startUrl).origin;


  const staticPaths = ["/assets", "/_next", "/static" , "/_", "/api"];
  const staticExtensions = [
    ".css", ".js", ".png", ".jpg", ".jpeg", ".gif",
    ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf", ".map",'.txt'
  ];

  const visited = new Set();
  const queue = [normalizeUrl(startUrl)];

  // Intercept AJAX/Fetch calls for better SPA handling
  await page.setRequestInterception(true);
  const dynamicLinks = new Set();
  page.on("request", (request) => {
    const url = normalizeUrl(request.url());
    if (
      url.startsWith(baseUrl) &&
      !staticPaths.some((path) => url.includes(path)) &&
      !staticExtensions.some((ext) => url.endsWith(ext))
    ) {
      dynamicLinks.add(url);
    }
    request.continue();
  });


  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      visited.add(url);

      const links = await page.evaluate(({ staticPaths, staticExtensions }) => {
        return Array.from(document.body.querySelectorAll("a"))
          .map((a) => a.href)
          .map((href) => href.split("#")[0]) // Remove hash links
          .map((href) => href.replace(/\/$/, "")) // Remove trailing slash
          .filter((href) =>
            href.startsWith(location.origin) &&
            !staticPaths.some((path) => href.includes(path)) &&
            !staticExtensions.some((ext) => href.endsWith(ext))
          );
      }, { staticPaths, staticExtensions });

      const extractedData = await page.evaluate(() => {

        const title = document.title;
        const body = document.body.innerText;
        const clonedBody = document.body.cloneNode(true);
        clonedBody.querySelectorAll('script, nav, svg').forEach((el) => el.remove());

        const aTag = Array.from(document.querySelectorAll("a")).map(
          (a) => a.href
        );
        const imageUrls = Array.from(document.querySelectorAll("img")).map(
          (img) => img.src
        );

        return { title, body, imageUrls, aTag, html: clonedBody.outerHTML };

      });

      const chunked = chunkText(extractedData.html);
      let data = '';
      for (const chunk of chunked) {
        console.log("serving chunk of size ", new TextEncoder().encode(chunk).length);
        const markdown = await generateMarkdown(chunk);
        data += markdown;
      }

      dataArr.push({ url, title: extractedData.title, markdownData: data });

      // dataArr.push({url, ...extractedData})

      await autoScroll(page);

      [...links, ...dynamicLinks].forEach((link) => {
        if (!visited.has(link)) queue.push(normalizeUrl(link));
      });

      console.log(`Visited: ${url}`);
      // console.log(data);
    } catch (err) {
      console.error(`Failed to crawl ${url}:`, err.message);
    }
  }

  await browser.close();
  return dataArr;
}

export default Crawler
