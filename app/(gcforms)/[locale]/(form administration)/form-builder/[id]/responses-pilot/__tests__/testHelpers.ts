/**
 * Test helpers for browser mode tests
 */

// Set to true to add visual delays for debugging/inspection
const VISUAL_DEBUG_MODE = process.env.VISUAL_DEBUG === "true";

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

/**
 * Wait helper that respects VISUAL_DEBUG_MODE.
 * In debug mode, waits for the specified duration for visual inspection.
 * In normal mode, skips the wait for faster test execution.
 *
 * @param ms - Milliseconds to wait in debug mode
 */
export async function visualWait(ms: number) {
  if (VISUAL_DEBUG_MODE) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Check if visual debug mode is enabled.
 * @returns true if VISUAL_DEBUG environment variable is set to "true"
 */
export function isVisualDebugMode(): boolean {
  return VISUAL_DEBUG_MODE;
}
