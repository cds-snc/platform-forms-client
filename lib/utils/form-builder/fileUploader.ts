import { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { Responses, FileInputResponse } from "@root/lib/types";
import { logMessage } from "@lib/logger";
import { getSignedS3Urls } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";

interface FileInput extends FileInputResponse {
  name: string;
  size: number;
  content: ArrayBuffer;
}

interface ProcessedFile {
  name: string;
  size: number;
  key: string;
  content?: ArrayBuffer; // content is removed after upload
}

const isFileInputResponse = (response: unknown): response is FileInputResponse => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response
  );
};

const isFileInput = (response: unknown): response is FileInput => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response &&
    response.name !== null &&
    response.size !== null &&
    response.content !== null &&
    !("key" in response) // Ensure it does not have a key property
  );
};

const isProcessedFile = (response: unknown): response is ProcessedFile => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "key" in response &&
    response.name !== null &&
    response.size !== null &&
    response.key !== null
  );
};

const fileExtractor = (originalObj: unknown) => {
  const fileInputRefList: Array<FileInput | ProcessedFile> = [];

  const extractorLogic = (
    originalObj: unknown,
    fileObjs: Array<FileInputResponse | ProcessedFile>
  ) => {
    // If it's not an {}, or [] stop now
    if (originalObj === null || typeof originalObj !== "object") return;

    // If it's a File Input object add it to the list and return
    if (isFileInputResponse(originalObj) || isProcessedFile(originalObj)) {
      return fileObjs.push(originalObj);
    }

    // If it's an {} or [] keep going down the rabbit hole
    for (const obj of Array.isArray(originalObj) ? originalObj : Object.entries(originalObj)) {
      extractorLogic(obj, fileObjs);
    }
  };
  // Let the recursive logic aka snake eating tail begin
  extractorLogic(originalObj, fileInputRefList);

  return fileInputRefList.reduce(
    (acc, fileRef) => {
      if (isFileInput(fileRef)) {
        acc.unprocessedFiles.push(fileRef);
        return acc;
      }
      if (isProcessedFile(fileRef)) {
        acc.processedFiles.push(fileRef);
        return acc;
      }
      // If it's neither a FileInput nor a ProcessedFile, we assume it's a blank file response
      // This could happen if the file was not filled in the form, so we add it

      acc.blankFiles.push(fileRef);
      return acc;
    },
    {
      unprocessedFiles: [] as FileInput[],
      processedFiles: [] as ProcessedFile[],
      blankFiles: [] as FileInputResponse[],
    }
  );
};

export const uploadFiles = async (responses: Responses) => {
  // Extract file responses by memory reference
  const fileInputReferences = fileExtractor(responses);

  // Get signed URLs for file upload
  const presignedURLS = await getSignedS3Urls(
    fileInputReferences.unprocessedFiles.map((file) => file.name)
  );

  if (presignedURLS.length !== fileInputReferences.unprocessedFiles.length) {
    throw new Error("Mismatch between number of files and pre-signed URLs");
  }

  // Upload each file to S3 using the pre-signed URLs
  const fileKeys = await Promise.allSettled(
    fileInputReferences.unprocessedFiles.map((file, index) =>
      uploadFile(file, presignedURLS[index])
    )
  );

  // Add keys to the processed files
  let fileRefsRemoved = 0; // Counter for removed files references from unprocessedFiles
  fileKeys.forEach((result, index) => {
    if (result.status === "rejected") {
      logMessage.error(
        `Failed to upload file: ${fileInputReferences.unprocessedFiles[index].name}`
      );
      return; // Skip this file if the upload failed
    }
    const file = fileInputReferences.unprocessedFiles[index - fileRefsRemoved] as ProcessedFile;
    file.key = result.value; // Assign the key to the file
    fileInputReferences.processedFiles.push(file); // Add the processed file to the list
    fileInputReferences.unprocessedFiles.splice(index - fileRefsRemoved, 1); // Remove the file from unprocessed files
    fileRefsRemoved++; // Increment the counter for removed files
  });

  // Remove the content from the processed files to prepare for form submission
  fileInputReferences.processedFiles.forEach((fileRef) => {
    if (fileRef.content) {
      delete fileRef.content; // Remove content after upload to save memory
    }
  });

  // Prep the blank file inputs for form submission
  fileInputReferences.blankFiles.forEach((fileRef) => {
    const processedFileRef = fileRef as ProcessedFile;
    processedFileRef.key = ""; // Set key to empty string for blank files
    delete processedFileRef.content; // Remove content property from blank files
  });

  // Now we can throw an error if there are any unprocessed files left
  if (fileInputReferences.unprocessedFiles.length > 0) {
    throw new Error(
      `Some files could not be processed: ${fileInputReferences.unprocessedFiles
        .map((file) => file.name)
        .join(", ")}`
    );
  }
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
  // Return the key for further error handling or confirmation
  return preSigned.fields.key;
};
