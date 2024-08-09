import { FileInputResponse, Responses } from "@lib/types";

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

const MAXIMUM_FILE_SIZE_IN_BYTES = 8 * 1024 * 1024 + 512; // 8.5MB

// See https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
export const htmlInputAccept = ALLOWED_FILE_TYPES.map((t) =>
  [t.mime].concat(t.extensions.map((e) => `.${e}`))
)
  .flat()
  .join(",");

export function isFileExtensionValid(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return false;

  return ALLOWED_FILE_TYPES.map((t) => t.extensions)
    .flat()
    .includes(extension);
}

export function isIndividualFileSizeValid(sizeInBytes: number): boolean {
  return sizeInBytes <= MAXIMUM_FILE_SIZE_IN_BYTES;
}

/**
 * There is a 8.5MB bodySizeLimit that applies to the entire POST payload, including
 * all uploaded files, configured in next.config.mjs
 *
 * Since uploaded files are serialized to base64, there is a ~35% overhead in file size,
 * making the limit for all files approximately 6MB.
 *
 * @param values
 * @param item
 * @param files
 * @param errors
 */
export function isAllFilesSizeValid(values: Responses): boolean {
  const files: FileInputResponse[] = [];
  for (const item in values) {
    const element = values[item];
    // We're in a repeating set
    if (Array.isArray(element)) {
      element.forEach((el) => {
        // @ts-expect-error - we know that el[0] is a FileInputResponse
        const nestedElement = el[0] as FileInputResponse;
        if (nestedElement.size) {
          files.push(nestedElement);
        }
      });
    } else {
      // Not repeating set
      if (typeof element === "object" && element.size) {
        files.push(element as FileInputResponse);
      }
    }
    if (files) {
      // file.size is the size reported by the browser which is the original file size.
      // Since we are base64 encoding the file prior to transfer, there is a ~35% overhead
      // in file size so we multiply by 1.35.
      const totalSize = files.reduce((sum, file) => Number(sum) + Number(file.size) * 1.35, 0);
      if (totalSize > MAXIMUM_FILE_SIZE_IN_BYTES) {
        return false;
      }
    }
  }

  return true;
}
