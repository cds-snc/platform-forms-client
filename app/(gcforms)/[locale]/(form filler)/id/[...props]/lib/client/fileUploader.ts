import { fileTypeFromBuffer } from "file-type";
import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { v4 as uuid } from "uuid";
import axios, { AxiosError, AxiosProgressEvent } from "axios";

import { ALLOWED_FILE_TYPES } from "@lib/validation/fileValidationClientSide";

import { Responses, FileInputResponse } from "@lib/types";
import { FileUploadError } from "../client/exceptions";

export async function isMimeTypeValid(file: FileInput): Promise<boolean> {
  // We can't use file-type to detect CSV or TXT files, so we'll check the extension.
  const lowerCaseName = file.name.toLowerCase();
  if (lowerCaseName.endsWith(".csv") || lowerCaseName.endsWith(".txt")) {
    return true;
  }
  const fileTypeResult = await fileTypeFromBuffer(file.content);
  const mimeType = fileTypeResult?.mime;

  if (!mimeType) return false;
  return ALLOWED_FILE_TYPES.map((t) => t.mime).includes(mimeType);
}

const isFileInput = (response: unknown): response is FileInput => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response &&
    response.name !== null &&
    response.size !== null &&
    response.content !== null
  );
};

export const isFileInputResponse = (response: unknown): response is FileInputResponse => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response
  );
};

export interface FileInput extends FileInputResponse {
  name: string;
  size: number;
  content: ArrayBuffer;
}

export const copyObjectExcludingFileContent = (
  originalObject: Responses,
  fileObjsRef: Record<string, FileInput> = {}
) => {
  const formValuesWithoutFileContent: Responses = {};
  const filterFileContent = <T>(originalState: T, filteredState: Record<string, T>): T => {
    if (originalState === null || typeof originalState !== "object") {
      return originalState;
    }

    if (Array.isArray(originalState)) {
      return originalState.map((item) => filterFileContent(item, {})) as unknown as T;
    }

    if (isFileInputResponse(originalState)) {
      const id = originalState.content !== null ? uuid() : null;

      // Collect the file reference if there is content
      if (id && isFileInput(originalState)) {
        fileObjsRef[id] = originalState;
      }
      // Return a shallow copy without content
      return {
        id,
        name: originalState.name,
        size: originalState.size,
      } as unknown as T;
    }

    Object.keys(originalState).forEach((key) => {
      filteredState[key] = filterFileContent((originalState as Record<string, T>)[key], {});
    });
    return filteredState as unknown as T;
  };
  filterFileContent(originalObject, formValuesWithoutFileContent);
  return { formValuesWithoutFileContent, fileObjsRef };
};

export const uploadFile = async (
  file: FileInput,
  preSigned: PresignedPost,
  progressCallback: (event: AxiosProgressEvent) => void
) => {
  const formData = new FormData();

  // Check mime type
  const isValidMimeType = await isMimeTypeValid(file);

  if (!isValidMimeType) {
    throw new FileUploadError(`Failed to upload file: ${file.name}`, file, 400);
  }

  Object.entries(preSigned.fields ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", new Blob([file.content]), file.name);

  return axios
    .post(preSigned.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: progressCallback,
    })
    .catch((error) => {
      const axiosError = error as AxiosError;

      throw new FileUploadError(
        `Failed to upload file: ${file.name}, error: ${axiosError.message}`,
        file,
        axiosError.response?.status
      );
    });
};
