import { FileInputResponse } from "@root/lib/types";

const isFileInput = (response: unknown): response is FileInputResponse => {
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

// Modified from:  https://github.com/cds-snc/platform-forms-client/pull/5772/files#diff-09b42a1cf4cc755e2ddcdc9d06795ea6191e25fcf8c109f6f312a56850444ba6R56
export const fileExtractor = (originalObj: unknown) => {
  const fileInputRefList: Array<FileInputResponse> = [];

  const extractorLogic = (originalObj: unknown, fileObjs: Array<FileInputResponse>) => {
    // If it's not an {}, or [] stop now
    if (originalObj === null || typeof originalObj !== "object") return;

    // If it's a File Input object add it to the list and return
    if (isFileInput(originalObj)) {
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
        acc.files.push(fileRef);
        return acc;
      }

      return acc;
    },
    {
      files: [] as FileInputResponse[],
    }
  );
};
