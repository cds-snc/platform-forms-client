import { fileTypeFromBuffer } from "file-type";
import DOMPurify from "dompurify";

export const MAX_FILE_SIZE = 10485760; // 10 MB matches file upload lambda see: generateSignedUrl

export const ALLOWED_FILE_TYPES = [
  { mime: "application/pdf", extensions: ["pdf"] },
  { mime: "text/plain", extensions: ["txt"] },
  { mime: "text/csv", extensions: ["csv"] },
  { mime: "application/msword", extensions: ["doc"] },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
  },
  { mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
  { mime: "image/png", extensions: ["png"] },
  { mime: "image/svg+xml", extensions: ["svg"] },
  { mime: "application/vnd.ms-excel", extensions: ["xls"] },
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
  },
  { mime: "application/vnd.apple.numbers", extensions: ["numbers"] },
  { mime: "application/xml", extensions: ["xml"] },
  { mime: "text/xml", extensions: ["xml"] },
];

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
export const htmlInputAccept = Array.from(
  ALLOWED_FILE_TYPES.reduce((acc, fileType) => {
    acc.add(fileType.mime);
    fileType.extensions.forEach((ext) => acc.add(`.${ext}`));
    return acc;
  }, new Set<string>())
).join(",");

export const isIndividualFileSizeValid = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

export function isFileExtensionValid(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return false;

  return ALLOWED_FILE_TYPES.some((fileType) => fileType.extensions.includes(extension));
}

/**
 * Validates the MIME type of a file against a list of allowed types.
 * If strict mode is disabled, the file's extension is checked against the allowed types.
 * If the MIME type is still undetermined, the function falls back to the file extension validation.
 * If the file extension is also not valid, the function returns false.
 */
export async function isMimeTypeValid(
  fileName: string,
  content: ArrayBuffer,
  strict: boolean
): Promise<boolean> {
  const fileTypeResult = await fileTypeFromBuffer(content);
  const mimeType = fileTypeResult?.mime;

  // Fallback to extension-based validation if strict mode is disabled
  // application/x-cfb is the MS2003 Doc/PPT/Excel Format, as well as MSI installers.
  if (!strict && (typeof mimeType === "undefined" || mimeType === "application/x-cfb")) {
    return isFileExtensionValid(fileName);
  }

  if (!mimeType) {
    return false;
  }

  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}

export const isSvg = (fileName: string): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension === "svg";
};

/**
 * Validates SVG content for security risks.
 * Returns false if the SVG contains potentially unsafe content that would be removed by DOMPurify.
 * This rejects files rather than sanitizing them.
 *
 * Allows standard SVG elements and attributes commonly found in design tool exports,
 * while blocking dangerous content like scripts and event handlers.
 */
export function isSvgContentSafe(content: ArrayBuffer): boolean {
  const svgString = new TextDecoder().decode(content);

  // Sanitize the SVG with comprehensive but safe settings
  const cleanSVG = DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: [
      "svg",
      "path",
      "circle",
      "rect",
      "g",
      "defs",
      "use",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "text",
      "tspan",
      "title",
      "desc",
      "metadata",
      "linearGradient",
      "radialGradient",
      "stop",
      "clipPath",
      "mask",
      "pattern",
      "image",
      "style",
      "filter",
      "feGaussianBlur",
      "feOffset",
      "feBlend",
      "feColorMatrix",
    ],
    ALLOWED_ATTR: [
      "viewBox",
      "d",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-dasharray",
      "stroke-dashoffset",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "x",
      "y",
      "x1",
      "x2",
      "y1",
      "y2",
      "width",
      "height",
      "transform",
      "id",
      "class",
      "style",
      "opacity",
      "fill-opacity",
      "stroke-opacity",
      "points",
      "xmlns",
      "xmlns:xlink",
      "xml:space",
      "version",
      "preserveAspectRatio",
      "enable-background",
      "data-name",
      "xlink:href",
      "offset",
      "stop-color",
      "stop-opacity",
      "gradientTransform",
      "gradientUnits",
      "spreadMethod",
      "clip-path",
      "clip-rule",
      "fill-rule",
      "filter",
      "stdDeviation",
      "dx",
      "dy",
      "in",
      "in2",
      "mode",
      "result",
      "type",
      "values",
    ],
    // Block event handlers and other dangerous attributes
    FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "onmouseout", "onfocus", "onblur"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
  });

  // Additional check for external URLs in fill and other attributes
  // Block external URLs that could be used for tracking or loading malicious content
  const externalUrlPatterns = [
    /fill="url\('http/i,
    /fill="url\("http/i,
    /fill="url\('ftp/i,
    /fill="url\(\/\//i,
    /stroke="url\('http/i,
    /stroke="url\("http/i,
    /href="http/i,
    /xlink:href="http/i,
  ];

  if (externalUrlPatterns.some((pattern) => pattern.test(cleanSVG))) {
    return false;
  }

  // Compare the sanitized version with the original
  // If they're different, the original contained unsafe content
  const normalizedOriginal = svgString.trim().replace(/\s+/g, " ");
  const normalizedClean = cleanSVG.trim().replace(/\s+/g, " ");

  return normalizedOriginal === normalizedClean;
}
