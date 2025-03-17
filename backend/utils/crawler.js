import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";



puppeteer.use(StealthPlugin());

async function Crawler(startUrl, maxPages = 10) {
  console.log("crawl function called")
  let dataArr = []
  const browser = await puppeteer.launch({ headless: false });
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
        const aTag = Array.from(document.querySelectorAll("a")).map(
          (a) => a.href
        );
        const imageUrls = Array.from(document.querySelectorAll("img")).map(
          (img) => img.src
        );

        return { title, body, imageUrls, aTag };

      });
      dataArr.push({url, ...extractedData})

      await autoScroll(page);

      [...links, ...dynamicLinks].forEach((link) => {
        if (!visited.has(link)) queue.push(normalizeUrl(link));
      });

      console.log(`Visited: ${url}`);
      // console.log(dataArr)
    } catch (err) {
      console.error(`Failed to crawl ${url}:`, err.message);
    }
  }

  await browser.close();
  return dataArr;
}
function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname.replace(/\/$/, ""); // Remove trailing slash
  } catch {
    return url; // Return original URL if parsing fails
  }
}
// Auto-scroll function to trigger dynamic content loading
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Crawler("https://faizanraza.vercel.app").then((urls) =>
//   console.log("Crawled URLs:", urls)
// );
// console.log(result)
export default Crawler
