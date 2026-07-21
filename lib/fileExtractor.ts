import {
  Responses,
  FileInput,
  ResponsesWithoutFileContent,
  FileInputResponse,
  FileInputResponseWithContent,
} from "@gcforms/types";

import { v4 as uuid } from "uuid";

const isFileInput = (response: unknown): response is FileInputResponseWithContent => {
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

const isFileInputResponse = (response: unknown): response is FileInputResponse => {
  return (
    response !== null &&
    typeof response === "object" &&
    "name" in response &&
    "size" in response &&
    "content" in response
  );
};

export const hasFiles = (values: unknown): values is Array<FileInputResponse> => {
  if (values === null || typeof values !== "object") return false;
  return fileExtractor(values).files.length > 0;
};

// Modified from:  https://github.com/cds-snc/platform-forms-client/pull/5772/files#diff-09b42a1cf4cc755e2ddcdc9d06795ea6191e25fcf8c109f6f312a56850444ba6R56
export const fileExtractor = (originalObj: unknown) => {
  const fileInputRefList: Array<FileInputResponse> = [];

  const extractorLogic = (originalObj: unknown, fileObjs: Array<FileInputResponse>) => {
    // If it's not an {}, or [] stop now
    if (originalObj === null || typeof originalObj !== "object") return;

    // If it's a File Input object add it to the list and return
    if (isFileInputResponse(originalObj)) {
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

export const copyObjectExcludingFileContent = (
  originalObject: Responses,
  fileObjsRef: Record<string, FileInput> = {},
  nullifyFileInput = false
) => {
  const formValuesWithoutFileContent: ResponsesWithoutFileContent = {};
  function filterFileContent<T>(originalState: T, filteredState: Record<string, T>): T {
    if (originalState === null || typeof originalState !== "object") {
      return originalState;
    }

    if (Array.isArray(originalState)) {
      return originalState.map((item) => filterFileContent(item, {})) as T;
    }

    if (isFileInputResponse(originalState)) {
      // Used to nullify file input when saving progress to file
      if (nullifyFileInput) {
        return {
          name: null,
          size: null,
        } as T;
      }
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
      } as T;
    }

    Object.keys(originalState).forEach((key) => {
      filteredState[key] = filterFileContent((originalState as Record<string, T>)[key], {});
    });
    return filteredState as unknown as T;
  }
  filterFileContent(originalObject, formValuesWithoutFileContent);

  return { formValuesWithoutFileContent, fileObjsRef };
};
