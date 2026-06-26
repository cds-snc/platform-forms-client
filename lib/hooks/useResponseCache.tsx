import { FormRestoredWarning } from "@clientComponents/forms/ResumeForm/FormRestoredWarning";
import { toast } from "@formBuilder/components/shared/Toast";
import type { Language } from "@lib/types/form-builder-types";
import {
  Responses,
  FileInput,
  ResponsesWithoutFileContent,
  FileInputResponseWithoutContent,
  FormProperties,
  FileInputResponse,
} from "@gcforms/types";
import { useTranslation } from "@i18n/client";
import { use, useEffect } from "react";
import { toggleSavedValues } from "@i18n/toggleSavedValues";
import { logMessage } from "../logger";
import { useAppUpdate } from "./useAppUpdate";

import { v4 as uuid } from "uuid";

const LOCAL_CACHE_NAME = "gcforms-virtual-files";
const SESSION_STORAGE_KEY = "form-data";

export type Options = {
  id: string;
  values: Responses;
  history: string[];
  currentGroup: string;
  language: string;
  formVersionId?: string;
};

export type RestoredProgress = {
  id: string;
  language: Language;
  values: Responses;
  formVersionId?: string;
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
const isFileInputResponseWithoutContent = (
  response: unknown
): response is FileInputResponseWithoutContent => {
  return (
    response !== null &&
    typeof response === "object" &&
    "id" in response &&
    "name" in response &&
    "size" in response
  );
};

const clearCache = async () => {
  const localCache = await caches.open(LOCAL_CACHE_NAME);
  const files = await localCache.keys();
  await Promise.all(
    files.map((file) => {
      logMessage.debug(`Cleaning up file ${file.url}`);
      localCache.delete(file);
    })
  );
};

// Needs to be called on submit
const clearResponseStorage = async () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  await clearCache();
};

const getFileInCache = async (id: string) => {
  const localCache = await caches.open(LOCAL_CACHE_NAME);
  const fileResponse = await localCache.match(`/virtual-files/${id}`);
  if (!fileResponse || !fileResponse.ok) {
    return null;
  }
  await localCache.delete(`/virtual-files/${id}`);

  return fileResponse.blob();
};

const storeFileInCache = async (id: string, data: FileInput) => {
  const localCache = await caches.open(LOCAL_CACHE_NAME);

  const fileBlob = new Blob([data.content]);

  const fileResponse = new Response(fileBlob, {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Length": fileBlob.size.toString(),
    },
  });

  // Save it using a unique URL path identifier
  await localCache.put(`/virtual-files/${id}`, fileResponse);
};

export const rebuildObjectWithFileContent = async (originalObject: ResponsesWithoutFileContent) => {
  const formValuesWithFileContent: Responses = { ...originalObject };
  const rehydrateFileContent = async function <T>(rehydratedObject: T): Promise<T> {
    if (rehydratedObject === null || typeof rehydratedObject !== "object") {
      return rehydratedObject;
    }

    if (Array.isArray(rehydratedObject)) {
      return Promise.all(rehydratedObject.map((item) => rehydrateFileContent(item))) as T;
    }

    if (isFileInputResponseWithoutContent(rehydratedObject)) {
      const fileData = {
        name: rehydratedObject.name,
        size: rehydratedObject.size,
        content: await getFileInCache(rehydratedObject.id)
          // Add error handling here to possible notify the user that file content could not be rehydrated
          .then((file) => file && file.arrayBuffer())
          .catch((e) => {
            logMessage.error(e);
            return null;
          }),
      } as T;

      return fileData;
    }

    await Promise.all(
      Object.keys(rehydratedObject).map(async (key) => {
        const obj = rehydratedObject as Record<string, T>;
        obj[key] = await rehydrateFileContent(obj[key]);
      })
    );
    return rehydratedObject;
  };
  await rehydrateFileContent(formValuesWithFileContent);

  return formValuesWithFileContent;
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
// Must remain outside of hook because it is invoked before components are rendered
const restoreSessionProgress = async (): Promise<RestoredProgress | false | undefined> => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const encodedformData = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!encodedformData) return undefined;

  try {
    const formData = Buffer.from(encodedformData, "base64").toString("utf8");

    if (!formData) return false;

    const parsedData = JSON.parse(formData);
    const rehydratedValues = await rebuildObjectWithFileContent(parsedData.values);
    await clearResponseStorage();
    return {
      id: parsedData.id,
      language: parsedData.language,
      values: rehydratedValues,
      formVersionId: parsedData.formVersionId,
    };
  } catch (e) {
    return false;
  }
};

export const saveSessionProgress = async ({
  id,
  values,
  history,
  currentGroup,
  language,
  formVersionId,
}: Options) => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  logMessage.debug("Saving Response Session Progress");

  // Keep text data in session storage
  // save files in indexDB, store private key in session storage
  // clear session storage and index db on visibility change (data still stored in form state memory)

  // Extract file content from formValues so they are not part of the submission call to the submit action
  const { formValuesWithoutFileContent, fileObjsRef } = copyObjectExcludingFileContent(values);

  // Store the file content in indexDB

  // const fileChecksums = await generateFileChecksums(fileObjsRef);

  await Promise.all(
    Object.keys(fileObjsRef).map((objId) => storeFileInCache(objId, fileObjsRef[objId]))
  );

  const formData = JSON.stringify({
    // Allow formId to be overwritten when used as part of Upload File to resume
    id,
    values: formValuesWithoutFileContent,
    history,
    currentGroup,
    language,
    formVersionId,
  });

  // Encode UTF-8 string to base64
  const encodedformDataEn = Buffer.from(formData, "utf8").toString("base64");
  sessionStorage.setItem(SESSION_STORAGE_KEY, encodedformDataEn);

  logMessage.debug("Completed Saving Response Session Progress");
};
// Start the promise on initial JS module load
const rawSessionValuesPromise = restoreSessionProgress();

export const useResponsesCache = (id: string, form: FormProperties, formVersionId?: string) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  type useResponseCacheOutput = {
    cachedSession?: RestoredProgress;
  };

  const { updateTriggered } = useAppUpdate();

  const output: useResponseCacheOutput = {};

  const rawData = use(rawSessionValuesPromise);

  useEffect(() => {
    // Show that there was an error loading data
    if (rawData === false) {
      toast.notice(<FormRestoredWarning />, "public-facing-form-wide");
    } else {
      // Hard page refresh was not caused by a i18n
      if (updateTriggered) {
        toast.success(t("saveAndResume.formRestored"), "public-facing-form");
      }
    }
  }, [rawData, language, t, updateTriggered]);

  if (!rawData) {
    // Show that there was an error loading data
    if (rawData === false) toast.notice(<FormRestoredWarning />, "public-facing-form-wide");

    return output;
  }

  output.cachedSession = { ...rawData };

  // if it's the wrong form and version we do not return any values
  if (output.cachedSession.id !== id || output.cachedSession.formVersionId !== formVersionId) {
    delete output.cachedSession;
    return output;
  }
  if (output.cachedSession.language !== language) {
    // If caused by an i18n transtion ensure values are in the right language
    output.cachedSession.values = toggleSavedValues(
      form,
      { values: output.cachedSession.values },
      output.cachedSession.language
    );
  }

  return output;
};
