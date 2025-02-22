# Web2MD

## Description
This project is a web scraping API that uses Puppeteer and Cheerio to extract webpage content, convert it into Markdown, and cache results in Redis for improved performance.

## Features
- Uses **Puppeteer Cluster** for efficient headless browser scraping
- Falls back to **Cheerio** for lightweight scraping if Puppeteer fails
- Converts extracted content into **Markdown** using Google Gemini AI
- Caches results in **Redis** to optimize performance
- Provides an API endpoint to fetch website data

## Technologies Used
- **Node.js** with **Express**
- **Puppeteer-Extra** (with Stealth Plugin)
- **Cheerio** (for lightweight scraping)
- **Google Gemini AI** (for Markdown conversion)
- **Redis** (for caching results)
- **Puppeteer Cluster** (for parallelized scraping)

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/web-scraper-api.git
   cd web-scraper-api
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and add the following environment variables:
   ```sh
   PORT=5000
   GEMINI_API_KEY=your_google_gemini_api_key
   REDIS_URL=your_redis_url
   ```
4. Start the server:
   ```sh
   npm start
   ```

## Usage
### API Endpoint
#### `POST /process-url`
**Request Body:**
```json
{
  "url": "https://example.com"
}
```
**Response:**
```json
{
  "message": "scraped successfully",
  "url": "https://example.com",
  "result": "# Extracted Markdown Content"
}
```

## Graceful Shutdown
The application listens for process termination signals and ensures proper cleanup of the Puppeteer Cluster and Redis connection:
```sh
Ctrl + C  # Stops the server gracefully
```

## License
This project is licensed under the MIT License.


