// Function to sanitize URLs to prevent XSS attacks and other security issues
export const getSafeUrl = (url: string): string | null => {
  try {
    // Trim the URL and then create a URL object to validate it
    const trimmedUrl = url.trim();
    const urlObj = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return null;
    }

    return trimmedUrl;
  } catch (e) {
    // If URL is invalid (will throw an error), return null
    return null;
  }
};
