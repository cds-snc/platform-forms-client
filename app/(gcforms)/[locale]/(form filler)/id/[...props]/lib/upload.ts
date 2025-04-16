import { type ProcessedFile } from "@lib/types/submission-types";
import { type TransformedResponse } from "./transformFormResponses";
export type FilesKeyUrlMap = Map<string, string>;
export type Files = Record<string, ProcessedFile | ProcessedFile[]>;

import { pushFileToS3 } from "@lib/s3-upload";

export const handleUpload = async (
  files: Files,
  uploadedFilesKeyUrlMapping: FilesKeyUrlMap,
  fields: TransformedResponse
) => {
  // Staging or Production AWS environments
  for (const [_key, value] of Object.entries(files)) {
    const fileOrArray = value;
    if (!Array.isArray(fileOrArray)) {
      if (fileOrArray.name) {
        // eslint-disable-next-line no-await-in-loop
        const { isValid, key } = await pushFileToS3(fileOrArray);
        if (isValid) {
          uploadedFilesKeyUrlMapping.set(fileOrArray.name, key);
          const splitKey = _key.split("-");
          if (splitKey.length > 1) {
            const currentValue = fields[splitKey[0]] as Record<string, unknown>[];
            if (!currentValue[Number(splitKey[1])]) {
              currentValue[Number(splitKey[1])] = {};
            }
            currentValue[Number(splitKey[1])][splitKey[2]] = key;
          } else {
            fields[_key] = key;
          }
        }
      }
    } else {
      // An array will be returned in a field that includes multiple files
      for (const fileItem of fileOrArray) {
        const index = fileOrArray.indexOf(fileItem);
        if (fileItem.name) {
          // eslint-disable-next-line no-await-in-loop
          const { isValid, key } = await pushFileToS3(fileItem);
          if (isValid) {
            uploadedFilesKeyUrlMapping.set(fileItem.name, key);
            const splitKey = _key.split("-");
            if (splitKey.length > 1) {
              const currentValue = fields[splitKey[0]] as Record<string, unknown>[];
              if (!currentValue[Number(splitKey[1])]) {
                currentValue[Number(splitKey[1])] = {};
              }
              currentValue[Number(splitKey[1])][`${splitKey[2]}-${index}`] = key;
            } else {
              fields[`${_key}-${index}`] = key;
            }
          }
        }
      }
    }
  }
};
