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
import { useEffect, useRef } from "react";
import { toggleSavedValues } from "@i18n/toggleSavedValues";
import { logMessage } from "../logger";
import { useAppUpdate } from "./useAppUpdate";
import { useGCFormsContext } from "./useGCFormContext";
import { copyObjectExcludingFileContent } from "../fileExtractor";
import { SetCookie, stringifySetCookie } from "cookie";

const LOCAL_CACHE_NAME = "gcforms-virtual-files";

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
  private previousStateEncryptionKey: CryptoKey | undefined;
  private currentStateEncryptionKey: CryptoKey;

  private constructor(newKey: CryptoKey, previousKey?: CryptoKey) {
    this.previousStateEncryptionKey = previousKey;
    this.currentStateEncryptionKey = newKey;
  }

  public static async create(): Promise<EncryptedCache> {
    if (typeof window === "undefined") {
      return {} as unknown as EncryptedCache;
    }
    const keys = await this.createOrLoadCryptoKey();
    return new EncryptedCache(keys.newKey, keys.oldKey);
  }

  private static createOrLoadCryptoKey = async () => {
    const newKey = await window.crypto.subtle
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

        const cookieValue: SetCookie = {
          name: "crypto-key",
          value: JSON.stringify(jwk),
          path: "/",
          secure: true,
          sameSite: true,
        };

        document.cookie = stringifySetCookie(cookieValue);

        logMessage.debug("Created Crypto key");
        return key;
      })
      .catch((e) => {
        logMessage.error("Could not generate or export private key");
        logMessage.error(e);
        throw e;
      });
    const keys: { newKey: CryptoKey; oldKey?: CryptoKey } = { newKey };

    const encryptionKey = document
      .querySelector('meta[name="crypto-key"]')
      ?.getAttribute("content");

    // Load previous key to decrypt previous state data
    if (encryptionKey) {
      const jwk = JSON.parse(encryptionKey);

      const importedKey = await window.crypto.subtle
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
      logMessage.debug("Imported Crypto key");

      keys.oldKey = importedKey;
    }

    return keys;
  };

  private encryptData = async (data: ArrayBuffer) => {
    const encryptionParams: AesGcmParams = {
      name: "AES-GCM",
      iv: window.crypto.getRandomValues(new Uint8Array(12)),
    };

    return {
      encryptedData: await window.crypto.subtle.encrypt(
        encryptionParams,
        this.currentStateEncryptionKey,
        data
      ),
      iv: encryptionParams.iv,
    };
  };

  private decryptData = async (data: ArrayBuffer, iv: string) => {
    if (!this.previousStateEncryptionKey) {
      throw new Error("Can not decrypt file without previous crypto key");
    }
    const decryptParams: AesGcmParams = {
      name: "AES-GCM",
      iv: Uint8Array.fromBase64(iv),
    };
    return window.crypto.subtle.decrypt(decryptParams, this.previousStateEncryptionKey, data);
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

    return this.decryptData(await fileResponse.blob().then((data) => data.arrayBuffer()), iv);
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
    const { encryptedData: encryptedFile, iv } = await this.encryptData(data.content);
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

  public storeFormDataInCache = async (data: string) => {
    const localCache = await caches.open(LOCAL_CACHE_NAME);

    const dataBuffer = new TextEncoder().encode(data).buffer;

    const { encryptedData, iv } = await this.encryptData(dataBuffer);
    const ivHeader = new Uint8Array("buffer" in iv ? iv.buffer : iv).toBase64();

    const formDataResponse = new Response(encryptedData, {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "application/octet-stream",
        IV: ivHeader,
      },
    });
    await localCache.put(`/form-data`, formDataResponse);
    logMessage.debug(`Saved Form Data in cache`);
  };

  public retrieveFormDataInCache = async (): Promise<Options | undefined> => {
    const localCache = await caches.open(LOCAL_CACHE_NAME);

    const formDataResponse = await localCache.match("/form-data");
    if (!formDataResponse) return undefined;

    const iv = formDataResponse.headers.get("IV");
    if (iv === null) {
      throw new Error(`Could not get IV value for encrypted form data`);
    }

    const decryptedBuffer = await this.decryptData(await formDataResponse.arrayBuffer(), iv);

    return JSON.parse(new TextDecoder().decode(decryptedBuffer));
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

export const clearCacheFiles = async () => {
  const localCache = await caches.open(LOCAL_CACHE_NAME);
  const files = await localCache.keys();
  await Promise.all(
    files.map((file) => {
      logMessage.debug(`Cleaning up file ${file.url}`);
      localCache.delete(file);
    })
  );
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
  if (typeof window === "undefined") {
    return false;
  }
  const formData = await encryptedCache.retrieveFormDataInCache().catch(async (e) => {
    logMessage.error(e);
    await clearCacheFiles();
    return undefined;
  });

  if (!formData) return undefined;

  try {
    const rehydratedValues = await rebuildObjectWithFileContent(formData.values);
    await clearCacheFiles();
    return {
      id: formData.id,
      language: formData.language as Language,
      values: rehydratedValues,
      formVersionId: formData.formVersionId,
    };
  } catch (e) {
    logMessage.error(e);
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

  await encryptedCache.storeFormDataInCache(formData);
  logMessage.debug("Completed Saving Response Session Progress");
};
// Start the promise on initial JS module load
const rawData = await restoreSessionProgress();

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
  const prevValues = useRef({});

  const output: useResponseCacheOutput = {};

  // AutoSave
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "hidden") {
        const values = getValues();
        if (values !== prevValues.current) {
          const history = getGroupHistory();
          saveSessionProgress({
            id: formId,
            values,
            history,
            currentGroup: currentGroup || "",
            language,
          }).then(() => {
            prevValues.current = values;
          });
        }
      }
    }, 2000);

    return () => {
      clearInterval(id);
    };
  }, [formId, getValues, getGroupHistory, currentGroup, language]);

  useEffect(() => {
    if (updateTriggered) {
      toast.success(t("saveAndResume.formRestored"), "public-facing-form");
    }
  }, [t, updateTriggered]);

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
