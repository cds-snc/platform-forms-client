export const ALLOWED_FILE_TYPES = [
  { mime: "application/pdf", extensions: ["pdf"] },
  { mime: "text/plain", extensions: ["txt"] },
  { mime: "text/csv", extensions: ["csv"] },
  { mime: "application/msword", extensions: ["doc"] },
  { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extensions: ["docx"] },
  { mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
  { mime: "image/png", extensions: ["png"] },
  { mime: "image/svg+xml", extensions: ["svg"] },
  { mime: "application/vnd.ms-excel", extensions: ["xls"] },
  { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extensions: ["xlsx"] },
  { mime: "application/vnd.apple.numbers", extensions: ["numbers"] },
];

const MAXIMUM_FILE_SIZE_IN_BYTES = 8000000; // 8 MB

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
export const htmlInputAccept = ALLOWED_FILE_TYPES.map(t => [t.mime].concat(t.extensions.map(e => `.${e}`))).flat().join(",");

export function isFileExtensionValid(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return false;

  return ALLOWED_FILE_TYPES.map(t => t.extensions).flat().includes(extension);
}

export function isFileSizeValid(sizeInBytes: number): boolean {
  return sizeInBytes <= MAXIMUM_FILE_SIZE_IN_BYTES;
}