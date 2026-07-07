import { FormRestoredWarning } from "@clientComponents/forms/ResumeForm/FormRestoredWarning";
import { toast } from "@formBuilder/components/shared/Toast";
import type { Language } from "@lib/types/form-builder-types";
import {
  Responses,
  FileInput,
  ResponsesWithoutFileContent,
  FileInputResponseWithoutContent,
} from "@gcforms/types";
import { useTranslation } from "@i18n/client";
import { use, useEffect } from "react";
import { toggleSavedValues } from "@i18n/toggleSavedValues";
import { logMessage } from "../logger";
import { useAppUpdate } from "./useAppUpdate";
import { useGCFormsContext } from "./useGCFormContext";
import { copyObjectExcludingFileContent } from "../fileExtractor";

const LOCAL_CACHE_NAME = "gcforms-virtual-files";
const SESSION_STORAGE_KEY = "form-data";
const CRYPTO_STORAGE_KEY = "crypto-key";

////////////////////////////////////////
// Types and Type Guards
////////////////////////////////////////

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

const isFileInputResponseWithoutContent = (
  response: unknown
): response is FileInputResponseWithoutContent => {
  return (
    response !== null && typeof response === "object" && "name" in response && "size" in response
  );
};

////////////////////////////////////////
// Crypto for File Encryption / Decryption
////////////////////////////////////////

class EncryptedCache {
  private encryptionKey: CryptoKey;

  private constructor(key: CryptoKey) {
    this.encryptionKey = key;
  }

  public static async create(): Promise<EncryptedCache> {
    if (typeof window === "undefined") {
      return {} as unknown as EncryptedCache;
    }
    const key = await this.createOrLoadCryptoKey();
    return new EncryptedCache(key);
  }

  private static createOrLoadCryptoKey = async () => {
    const encryptionKey = sessionStorage.getItem(CRYPTO_STORAGE_KEY);
    if (!encryptionKey) {
      return window.crypto.subtle
        .generateKey(
          {
            name: "AES-GCM",
            length: 256,
          },
          true,
          ["encrypt", "decrypt"]
        )
        .then(async (key) => {
          const jwk = await window.crypto.subtle.exportKey("jwk", key);

          sessionStorage.setItem(CRYPTO_STORAGE_KEY, JSON.stringify(jwk));
          return key;
        })
        .catch((e) => {
          logMessage.error("Could not generate or export private key");
          logMessage.error(e);
          throw e;
        });
    } else {
      const jwk = JSON.parse(encryptionKey);

      const key = await window.crypto.subtle
        .importKey(
          "jwk",
          jwk,
          {
            name: "AES-GCM",
            length: 256,
          },
          false,
          ["encrypt", "decrypt"]
        )
        .catch((e) => {
          logMessage.error("Could not import Private key");
          logMessage.error(e);
          throw e;
        });

      return key;
    }
  };

  private encryptFile = async (file: ArrayBuffer) => {
    const encryptionParams: AesGcmParams = {
      name: "AES-GCM",
      iv: window.crypto.getRandomValues(new Uint8Array(12)),
    };

    return {
      encryptedFile: await window.crypto.subtle.encrypt(encryptionParams, this.encryptionKey, file),
      iv: encryptionParams.iv,
    };
  };

  private decryptFile = async (file: ArrayBuffer, iv: string) => {
    const decryptParams: AesGcmParams = {
      name: "AES-GCM",
      iv: Uint8Array.fromBase64(iv),
    };
    return window.crypto.subtle.decrypt(decryptParams, this.encryptionKey, file);
  };

  public getFileInCache = async (id: string) => {
    const localCache = await caches.open(LOCAL_CACHE_NAME);
    const fileResponse = await localCache.match(`/virtual-files/${id}`);
    if (!fileResponse || !fileResponse.ok) {
      return null;
    }
    await localCache.delete(`/virtual-files/${id}`);

    const iv = fileResponse.headers.get("IV");

    if (iv === null) {
      throw new Error(`Could not get IV value for /virtual-files/${id}`);
    }

    return this.decryptFile(await fileResponse.blob().then((data) => data.arrayBuffer()), iv);
  };

  public storeFileInCache = async (id: string, data: FileInput | object) => {
    const localCache = await caches.open(LOCAL_CACHE_NAME);

    // File input is empty or reset so remove file if it exists in cache
    if (!isFileInput(data)) {
      logMessage.debug(`Deleting file ${id} from cache`);
      localCache.delete(`/virtual-files/${id}`);
      return;
    }

    logMessage.debug(`Saving File ${id} in cache`);
    const { encryptedFile, iv } = await this.encryptFile(data.content);
    const fileBlob = new Blob([encryptedFile]);
    const ivHeader = new Uint8Array("buffer" in iv ? iv.buffer : iv).toBase64();

    const fileResponse = new Response(fileBlob, {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Length": fileBlob.size.toString(),
        IV: ivHeader,
      },
    });
    // Save it using a unique URL path identifier
    await localCache.put(`/virtual-files/${id}`, fileResponse);
    logMessage.debug(`Saved File ${id} in cache`);
  };
}

export const encryptedCache = await EncryptedCache.create().catch((e) => {
  logMessage.error(`Error in creation of encrypted Cache`);
  logMessage.error(e);
  throw e;
});

////////////////////////////////////////
// Cache Functions
////////////////////////////////////////

const clearCacheFiles = async () => {
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
export const clearResponseStorage = async () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(CRYPTO_STORAGE_KEY);
  await clearCacheFiles();
};

////////////////////////////////////////
// Form Content Saving and Restoration
////////////////////////////////////////

export const rebuildObjectWithFileContent = async (originalObject: ResponsesWithoutFileContent) => {
  const formValuesWithFileContent: Responses = { ...originalObject };
  const rehydrateFileContent = async function <T>(rehydratedObject: T, key: string): Promise<T> {
    if (rehydratedObject === null || typeof rehydratedObject !== "object") {
      return rehydratedObject;
    }

    if (Array.isArray(rehydratedObject)) {
      return Promise.all(rehydratedObject.map((item) => rehydrateFileContent(item, key))) as T;
    }

    if (isFileInputResponseWithoutContent(rehydratedObject)) {
      const fileData = {
        name: rehydratedObject.name,
        size: rehydratedObject.size,
        content: await encryptedCache.getFileInCache(key),
      } as T;

      logMessage.debug(
        `Restoring file ${rehydratedObject.name} with values ${JSON.stringify(fileData)} `
      );

      return fileData;
    }

    await Promise.all(
      Object.keys(rehydratedObject).map(async (key) => {
        const obj = rehydratedObject as Record<string, T>;
        obj[key] = await rehydrateFileContent(obj[key], key);
      })
    );
    return rehydratedObject;
  };
  await rehydrateFileContent(formValuesWithFileContent, "");

  return formValuesWithFileContent;
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

export const saveSessionProgress = ({
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
  // save files in cache, store private key in session storage

  // Extract file content from formValues so they are not part of session storage
  const { formValuesWithoutFileContent } = copyObjectExcludingFileContent(values);

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

type useResponseCacheOutput = {
  cachedSession?: RestoredProgress;
};

////////////////////////////////////////
// Hook for importing in to Form Component
////////////////////////////////////////

export const useResponsesCache = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { updateTriggered } = useAppUpdate();
  const { formId, formRecord, getValues, getGroupHistory, currentGroup } = useGCFormsContext();

  // Should save occur on a timed loop or on data change??

  const output: useResponseCacheOutput = {};

  const rawData = use(rawSessionValuesPromise);

  //Bryan - Thursday start here and begin testing..

  useEffect(() => {
    const saveData = () => {
      logMessage.debug(`Document visibility state is ${document.visibilityState}`);
      if (document.visibilityState === "hidden") {
        const values = getValues();
        const history = getGroupHistory();
        saveSessionProgress({
          id: formId,
          values,
          history,
          currentGroup: currentGroup || "",
          language,
        });
      }
    };

    window.addEventListener("visibilitychange", saveData);
    return () => {
      window.removeEventListener("visibilitychange", saveData);
    };
  }, [formId, getValues, getGroupHistory, currentGroup, language]);

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
  }, [rawData, t, updateTriggered]);

  if (!rawData) {
    // Show that there was an error loading data
    if (rawData === false) toast.notice(<FormRestoredWarning />, "public-facing-form-wide");

    return output;
  }

  output.cachedSession = { ...rawData };

  // if it's the wrong form and version we do not return any values
  if (output.cachedSession.id !== formId) {
    delete output.cachedSession;
    return output;
  }
  if (output.cachedSession.language !== language) {
    // If caused by an i18n transtion ensure values are in the right language
    output.cachedSession.values = toggleSavedValues(
      formRecord.form,
      { values: output.cachedSession.values },
      output.cachedSession.language
    );
  }

  return output;
};
