import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { logMessage } from "@root/lib/logger";
import { Responses, FileInputResponse } from "@root/lib/types";
import { getSignedS3Urls } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";

// Upload file to S3 using signed URL

// Return file URL

interface FileInput extends FileInputResponse {
  name: string;
  size: number;
  content: ArrayBuffer;
}

interface ProcessedFile extends FileInput {
  key: string;
}

const isFileResponse = (response: unknown): response is FileInputResponse => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response
  );
};

const fileExtractor = (originalObj: unknown): FileInput[] => {
  const fileInputObjectList: FileInputResponse[] = [];

  const extractorLogic = (originalObj: unknown, fileObjs: FileInputResponse[]) => {
    // If it's not an {}, or [] stop now
    if (originalObj === null || typeof originalObj !== "object") return;

    // If it's a File Input object add it to the list and return
    if (isFileResponse(originalObj)) {
      return fileObjs.push(originalObj);
    }

    // If it's an {} or [] keep going down the rabbit hole
    for (const obj of Array.isArray(originalObj) ? originalObj : Object.entries(originalObj)) {
      extractorLogic(obj, fileObjs);
    }
  };
  // Let the recursive logic aka snake eating tail begin
  extractorLogic(originalObj, fileInputObjectList);

  return fileInputObjectList.filter(
    (file) => file.name && file.size && file.content
  ) as FileInput[];
};

export const uploadFiles = async (responses: Responses) => {
  // Extract file responses by memory reference
  const fileInputReferences = fileExtractor(responses);
  // Get signed URLs for file upload
  const presignedURLS = await getSignedS3Urls(fileInputReferences.map((file) => file.name));

  if (presignedURLS.length !== fileInputReferences.length) {
    throw new Error("Mismatch between number of files and pre-signed URLs");
  }

  // Upload each file to S3 using the pre-signed URLs
  await Promise.all(
    fileInputReferences.map((file, index) => uploadFile(file, presignedURLS[index]))
  );

  return responses;
};

const uploadFile = async (file: FileInput, preSigned: PresignedPost) => {
  const formData = new FormData();
  Object.entries(preSigned.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", new Blob([file.content]), file.name);

  const response = await fetch(preSigned.url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${file.name}, file status ${response.status}`);
  }
  logMessage.info(`File uploaded successfully: ${file.name}`);
  (file as ProcessedFile).key = preSigned.fields.key;
  (file as FileInputResponse).content = null;
};
