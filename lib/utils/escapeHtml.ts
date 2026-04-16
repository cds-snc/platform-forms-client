/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts &, <, >, ", and ' to their HTML entity equivalents
 */
export const escapeHtml = (text: string | unknown): string => {
  if (typeof text !== "string") {
    return String(text);
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
