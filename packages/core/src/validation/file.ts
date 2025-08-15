import { fileTypeFromBuffer } from "file-type";
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
];

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
export const htmlInputAccept = ALLOWED_FILE_TYPES.map((t) =>
  [t.mime].concat(t.extensions.map((e) => `.${e}`))
)
  .flat()
  .join(",");

export const isIndividualFileSizeValid = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

export function isFileExtensionValid(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return false;

  return ALLOWED_FILE_TYPES.map((t) => t.extensions)
    .flat()
    .includes(extension);
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
  if (!strict && typeof mimeType === "undefined") {
    return isFileExtensionValid(fileName);
  }

  if (!mimeType) {
    return false;
  }

  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}
