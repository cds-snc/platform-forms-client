"use client";
import { FormRestoredWarning } from "@clientComponents/forms/ResumeForm/FormRestoredWarning";
import { VersionChangedToast } from "@clientComponents/forms/ResumeForm/VersionChangedToast";
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
import { FormSavingEvent } from "../client/formDataSavingEvent";

const LOCAL_CACHE_NAME = "gcforms-virtual-files";

////////////////////////////////////////
// Types and Type Guards
////////////////////////////////////////

type Options = {
  id: string;
  values: Responses;
  history: string[];
  currentGroup: string;
  language: string;
  versionNumber?: number | null;
  restoredForm: boolean;
};

type RestoredProgress = {
  id: string;
  language: Language;
  values: Responses;
  versionNumber: number;
  restoredForm: boolean;
};

const shouldRunModuleOnInit = () => {
  if (typeof window !== "undefined") {
    return true;
  }
  return false;
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
export type { EncryptedCache };

class EncryptedCache {
  private previousStateEncryptionKey: CryptoKey | undefined;
  private currentStateEncryptionKey: CryptoKey;
  private cookieEncryptionKey: SetCookie;

  private constructor(newKey: CryptoKey, cookieKey: SetCookie, previousKey?: CryptoKey) {
    this.previousStateEncryptionKey = previousKey;
    this.currentStateEncryptionKey = newKey;
    this.cookieEncryptionKey = cookieKey;
  }

  public static async create() {
    if (!shouldRunModuleOnInit()) {
      return {} as EncryptedCache;
    }

    const keys = await this.createOrLoadCryptoKey();
    const jwk = await window.crypto.subtle.exportKey("jwk", keys.newKey);

    const cookieValue: SetCookie = {
      name: "crypto-key",
      value: JSON.stringify(jwk),
      path: "/",
      secure: true,
      sameSite: true,
    };

    return new EncryptedCache(keys.newKey, cookieValue, keys.oldKey);
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
      .catch((e) => {
        logMessage.error("Could not generate or export private key");
        logMessage.error(e);
        throw e;
      });

    const keys: { newKey: CryptoKey; oldKey?: CryptoKey } = {
      newKey,
    };

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

      keys.oldKey = importedKey;
    }

    return keys;
  };

  public prepareForReload = () => {
    document.cookie = stringifySetCookie(this.cookieEncryptionKey);
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
    if (!this.previousStateEncryptionKey) {
      return null;
    }
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
      localCache.delete(`/virtual-files/${id}`);
      return;
    }

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
  };

  public retrieveFormDataInCache = async (): Promise<Options | undefined> => {
    if (!this.previousStateEncryptionKey) {
      return undefined;
    }
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

  public clearCache = async () => {
    if (typeof caches !== "undefined") {
      const localCache = await caches.open(LOCAL_CACHE_NAME);
      const files = await localCache.keys();
      await Promise.all(
        files.map(async (file) => {
          return localCache.delete(file);
        })
      );
    }
  };
}
// Create encrypted cache instance which will be stored on the global `window` object
export const encryptedCache = await EncryptedCache.create().catch((e) => {
  logMessage.error(`Error in creation of encrypted Cache`);
  logMessage.error(e);
  throw e;
});

////////////////////////////////////////
// Form Content Saving and Restoration
////////////////////////////////////////

const rebuildObjectWithFileContent = async (originalObject: ResponsesWithoutFileContent) => {
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
        content: await encryptedCache.getFileInCache(rehydratedObject.id),
      } as T;

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
  if (!shouldRunModuleOnInit()) {
    return false;
  }
  try {
    const formData = await encryptedCache.retrieveFormDataInCache().catch(async (e: unknown) => {
      logMessage.error(e);
      await encryptedCache.clearCache();
      return undefined;
    });

    if (!formData) return undefined;

    const rehydratedValues = await rebuildObjectWithFileContent(formData.values);

    return {
      id: formData.id,
      language: formData.language as Language,
      values: rehydratedValues,
      versionNumber: formData.versionNumber ?? 1,
      restoredForm: formData.restoredForm ?? false,
    };
  } catch (e) {
    logMessage.error(e);
    return false;
  } finally {
    if (shouldRunModuleOnInit()) {
      await encryptedCache.clearCache();
    }
  }
};

export const saveSessionProgress = async ({
  id,
  values,
  history,
  currentGroup,
  language,
  versionNumber,
  restoredForm,
}: Options) => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  logMessage.debug("Saving Response Session Progress");

  // Extract file content from formValues so they are not part of session storage
  const { formValuesWithoutFileContent, fileObjsRef } = copyObjectExcludingFileContent(values);

  const formData = JSON.stringify({
    // Allow formId to be overwritten when used as part of Upload File to resume
    id,
    values: formValuesWithoutFileContent,
    history,
    currentGroup,
    language,
    versionNumber: versionNumber ?? 1,
    restoredForm,
  });

  await Promise.all([
    encryptedCache.storeFormDataInCache(formData),
    Object.keys(fileObjsRef).map((key) => encryptedCache.storeFileInCache(key, fileObjsRef[key])),
  ]);
  encryptedCache.prepareForReload();

  logMessage.debug("Completed Saving Response Session Progress");
};

// Start the promise on initial JS module load
const rawData = await restoreSessionProgress();

type useResponseCacheOutput = {
  cachedSession?: RestoredProgress;
  saveSessionFromContext: () => Promise<boolean | undefined>;
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
  const hasSaved = useRef(false);
  const saveSessionFromContext = async () => {
    const values = getValues();
    const history = getGroupHistory();
    return saveSessionProgress({
      id: formId,
      values,
      history,
      currentGroup: currentGroup || "",
      language,
      versionNumber: formRecord.versionNumber,
      restoredForm: false,
    });
  };

  const output: useResponseCacheOutput = {
    saveSessionFromContext,
  };

  const previousFormVersionNumber = rawData ? rawData.versionNumber : 1;
  const currentFormVersionNumber = formRecord.versionNumber ?? 1;

  // Listen and save form data when required
  useEffect(() => {
    // Public facing form filler page
    const saveData = (ev: Event) => {
      const formSavingEvent = ev as FormSavingEvent;
      saveSessionFromContext().then(() => {
        hasSaved.current = true;
        const event = new Event("beforeunload", { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        window.location.href = formSavingEvent.href;
      });
    };
    window.addEventListener("saveformdata", saveData);
    return () => {
      window.removeEventListener("saveformdata", saveData);
    };
  });

  //Show user warning if navigating through a path that does not save data
  useEffect(() => {
    // Public facing form filler page
    const warnUser = (event: BeforeUnloadEvent) => {
      // Ask the user if they want to continue only if the form is still in progress
      if (!hasSaved.current && document.querySelector('div[id="form-filler"]')) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warnUser);
    return () => {
      window.removeEventListener("beforeunload", warnUser);
    };
  });

  useEffect(() => {
    if (updateTriggered || (rawData && rawData.restoredForm)) {
      toast.success(t("saveAndResume.formRestored"), "public-facing-form");
    }

    if (previousFormVersionNumber !== currentFormVersionNumber && rawData && rawData.restoredForm) {
      toast.notice(<VersionChangedToast />, "public-facing-form-wide");
    }

    if (!rawData) {
      // Show that there was an error loading data
      if (rawData === false) toast.notice(<FormRestoredWarning />, "public-facing-form-wide");
    }
  }, [t, updateTriggered, previousFormVersionNumber, currentFormVersionNumber]);

  if (!rawData) {
    return output;
  }

  // if it's the wrong form we do not return any values
  if (rawData.id !== formId) {
    return output;
  }

  output.cachedSession = { ...rawData };

  if (output.cachedSession.language !== language) {
    // If caused by an i18n transtion ensure values are in the right language
    output.cachedSession.values = toggleSavedValues(
      formRecord.form.elements,
      output.cachedSession.values,
      output.cachedSession.language
    );
  }

  return output;
};
