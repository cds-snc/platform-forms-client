import { fileTypeFromBuffer } from "file-type";
export const MAX_FILE_SIZE = 10485760; // 10 MB matches file upload lambda see: generateSignedUrl

export const ALLOWED_FILE_TYPES = [
  { mime: "application/pdf", extensions: ["pdf"] },
  { mime: "application/msword", extensions: ["doc"] },
  { mime: "application/vnd.ms-excel", extensions: ["xls"] },
  {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
  },
  {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
  },
  { mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
  { mime: "image/png", extensions: ["png"] },
  { mime: "text/plain", extensions: ["txt"] },
  { mime: "text/csv", extensions: ["csv"] },
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
