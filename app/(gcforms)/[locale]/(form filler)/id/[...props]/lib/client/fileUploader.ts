import { PresignedPost } from "@aws-sdk/s3-presigned-post";

import axios, { AxiosError, AxiosProgressEvent } from "axios";
import { FileInput } from "@gcforms/types";
import { FileUploadError } from "../client/exceptions";
import { isMimeTypeValid } from "@gcforms/core";

export const uploadFile = async (
  file: FileInput,
  preSigned: PresignedPost,
  progressCallback: (event: AxiosProgressEvent) => void
) => {
  const formData = new FormData();

  // Check mime type
  const validMime = await isMimeTypeValid(file.name, file.content, false);

  if (!validMime) {
    throw new FileUploadError(`Failed to upload file: ${file.name}`, file, 400, "mime");
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
