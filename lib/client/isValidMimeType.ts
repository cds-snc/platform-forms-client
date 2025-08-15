import { fileTypeFromBuffer } from "file-type";
import { ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";

export async function isMimeTypeValid(content: ArrayBuffer): Promise<boolean> {
  const fileTypeResult = await fileTypeFromBuffer(content);
  const mimeType = fileTypeResult?.mime;

  if (!mimeType) return false;
  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}
