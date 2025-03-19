export function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname.replace(/\/$/, ""); // Remove trailing slash
  } catch {
    return url; // Return original URL if parsing fails
  }
}