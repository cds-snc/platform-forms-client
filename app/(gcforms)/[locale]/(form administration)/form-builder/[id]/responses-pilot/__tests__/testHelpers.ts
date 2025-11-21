/**
 * Test helpers for browser mode tests
 */

/**
 * Loads Google Fonts and sets up CSS variables for Noto Sans and Lato fonts.
 * Call this in browser mode tests to ensure proper font rendering.
 */
export function setupFonts() {
  const fontLink = document.createElement("link");
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;200;300;400;500;600;700;800;900&family=Lato:wght@400;700&display=swap";
  fontLink.rel = "stylesheet";
  document.head.appendChild(fontLink);

  // Add font CSS variables to html element
  document.documentElement.style.setProperty("--font-noto-sans", "'Noto Sans', sans-serif");
  document.documentElement.style.setProperty("--font-lato", "'Lato', sans-serif");
}
