import axios, { AxiosError, AxiosProgressEvent } from "axios";

import { PresignedPost } from "@aws-sdk/s3-presigned-post";

type FileInput = {
  name: string;
  size: number;
  content: Buffer<ArrayBufferLike>;
};

function isArrayBuffer(value: ArrayBufferLike): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}

export const uploadFile = async (file: FileInput, preSigned: PresignedPost) => {
  const formData = new FormData();

  Object.entries(preSigned.fields ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });
  if (isArrayBuffer(file.content.buffer)) {
    formData.append("file", new Blob([file.content.buffer]), file.name);
  } else {
    throw new Error("File content is not an ArrayBuffer");
  }

  return axios
    .post(preSigned.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .catch((error) => {
      const axiosError = error as AxiosError;

      throw new Error(`Failed to upload file: ${file.name}, error: ${axiosError.message}`);
    });
};
