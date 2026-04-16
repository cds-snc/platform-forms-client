import { escapeHtml } from "./escapeHtml";
import { newLineToHtml } from "./newLineToHtml";

export const stripEntities = (text: string): string => {
  return text
    .replace(/&#32;/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
};

export const stripLineBreaks = (text: string): string => {
  return text.replace(/(\r\n|\n|\r)/gm, " ");
};

export const stripMarkdown = (text: string): string => {
  return (
    text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove emphasis (bold, italic, strikethrough)
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove unordered lists
      .replace(/^\s*[-+*]\s+/gm, "")
      // Remove ordered lists
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove extra spaces
      .replace(/\s{2,}/g, " ")
      // Remove remaining Markdown characters
      .replace(/[*_~`]/g, "")
      // Trim leading and trailing whitespace
      .trim()
  );
};

export const toPlainText = (text: string): string => {
  return stripEntities(stripLineBreaks(stripMarkdown(text)));
};

export const formatUserInput = (text: string): string => {
  return newLineToHtml(escapeHtml(text));
};
