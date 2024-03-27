import { fileTypeFromBuffer } from "file-type";
import {
  ALLOWED_FILE_TYPES,
  isFileExtensionValid,
  isFileSizeValid,
} from "./fileValidationClientSide";

export enum FileValidationResult {
  VALID,
  SIZE_IS_TOO_LARGE,
  INVALID_EXTENSION,
  INVALID_MIME_TYPE,
}

export async function validateFileToUpload(
  fileName: string,
  fileSize: number,
  fileAsBuffer: Buffer
): Promise<{ result: FileValidationResult; detectedValue?: string }> {
  const sizeOfBufferInBytes = Buffer.byteLength(fileAsBuffer);

  if (!isFileSizeValid(fileSize) || !isFileSizeValid(sizeOfBufferInBytes)) {
    return {
      result: FileValidationResult.SIZE_IS_TOO_LARGE,
      detectedValue: `${fileSize} (fileSize) / ${sizeOfBufferInBytes.toString()} (sizeOfBuffer)`,
    };
  }

  if (!isFileExtensionValid(fileName)) {
    return {
      result: FileValidationResult.INVALID_EXTENSION,
      detectedValue: fileName,
    };
  }

  const fileTypeResult = await fileTypeFromBuffer(fileAsBuffer);

  if (fileTypeResult) {
    // isFileExtensionValid expect a complete filename but the file-type API only gives us the extension
    if (!isFileExtensionValid(`test.${fileTypeResult.ext}`)) {
      return {
        result: FileValidationResult.INVALID_EXTENSION,
        detectedValue: fileTypeResult.ext,
      };
    }

    if (!isFileMimeTypeValid(fileTypeResult.mime)) {
      return {
        result: FileValidationResult.INVALID_MIME_TYPE,
        detectedValue: fileTypeResult.mime,
      };
    }
  } else {
    /**
     * The `file-type`library is not able to detect some type of files (e.g. doc;xls;csv;svg). (See https://www.npmjs.com/package/file-type#supported-file-types)
     * We used to have https://www.npmjs.com/package/mmmagic to detect text-based file format but it is no longer compatible with our version of NextJS.
     * Since there is a file scanner on the infra side we can let the files go through and assume they are probably text/plain files.
     */
  }

  return { result: FileValidationResult.VALID };
}

function isFileMimeTypeValid(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}
