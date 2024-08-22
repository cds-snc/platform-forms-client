import { fileTypeFromBuffer } from "file-type";
import {
  ALLOWED_FILE_TYPES,
  isFileExtensionValid,
  isIndividualFileSizeValid,
} from "./fileValidationClientSide";

export type FileValidationResult =
  | {
      status: "valid";
    }
  | {
      status: "size-is-too-large";
      fileSizeInBytes: number;
      sizeOfProcessedFileDataBuffer: number;
    }
  | {
      status: "invalid-given-extension";
      fileName: string;
    }
  | {
      status: "invalid-mime-associated-extension";
      mimeType: string;
      associatedExtension: string;
    }
  | {
      status: "invalid-mime-type";
      mimeType: string;
    };

export async function validateFileToUpload(
  fileName: string,
  fileSizeInBytes: number,
  fileAsBuffer: Buffer
): Promise<FileValidationResult> {
  const sizeOfBufferInBytes = Buffer.byteLength(fileAsBuffer);

  if (
    !isIndividualFileSizeValid(fileSizeInBytes) ||
    !isIndividualFileSizeValid(sizeOfBufferInBytes)
  ) {
    return {
      status: "size-is-too-large",
      fileSizeInBytes,
      sizeOfProcessedFileDataBuffer: sizeOfBufferInBytes,
    };
  }

  if (!isFileExtensionValid(fileName)) {
    return {
      status: "invalid-given-extension",
      fileName,
    };
  }

  const fileTypeResult = await fileTypeFromBuffer(fileAsBuffer);

  if (fileTypeResult) {
    // isFileExtensionValid expect a complete filename but the file-type API only gives us the extension
    if (!isFileExtensionValid(`test.${fileTypeResult.ext}`)) {
      return {
        status: "invalid-mime-associated-extension",
        mimeType: fileTypeResult.mime,
        associatedExtension: fileTypeResult.ext,
      };
    }

    if (!isFileMimeTypeValid(fileTypeResult.mime)) {
      return {
        status: "invalid-mime-type",
        mimeType: fileTypeResult.mime,
      };
    }
  } else {
    /**
     * The `file-type`library is not able to detect some type of files (e.g. doc;xls;csv;svg). (See https://www.npmjs.com/package/file-type#supported-file-types)
     * We used to have https://www.npmjs.com/package/mmmagic to detect text-based file format but it is no longer compatible with our version of NextJS.
     * Since there is a file scanner on the infra side we can let the files go through and assume they are probably text/plain files.
     */
  }

  return { status: "valid" };
}

function isFileMimeTypeValid(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}
