"use client";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import isEqual from "lodash.isequal";
import { useSession } from "next-auth/react";
import { logMessage } from "@lib/logger";
import { safeJSONParse } from "@lib/utils";
import { CreateOrUpdateTemplateType, createOrUpdateTemplate } from "@formBuilder/actions";
import { FormProperties, FormRecord } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useSubscibeToTemplateStore } from "@lib/store/hooks/useSubscibeToTemplateStore";

export type SaveDraftStatus = "saved" | "skipped" | "invalid" | "locked" | "error";

type SaveDraftResult = {
  status: SaveDraftStatus;
  formId?: string;
};

interface TemplateApiType {
  templateIsDirty: React.MutableRefObject<boolean>;
  updatedAt: number | undefined;
  setUpdatedAt: React.Dispatch<React.SetStateAction<number | undefined>>;
  createOrUpdateTemplate:
    | (({
        id,
        formConfig,
        name,
        deliveryOption,
        securityAttribute,
        saveAndResume,
        notificationsInterval,
      }: CreateOrUpdateTemplateType) => Promise<{
        formRecord: FormRecord | null;
        error?: string;
      }>)
    | null;
  saveDraft: () => Promise<SaveDraftResult>;
  saveDraftIfNeeded: () => Promise<SaveDraftResult>;
  resetState: () => void;
}

const defaultTemplateApi: TemplateApiType = {
  templateIsDirty: { current: false },
  updatedAt: undefined,
  setUpdatedAt: () => {},
  createOrUpdateTemplate: null,
  saveDraft: async () => ({ status: "skipped" }),
  saveDraftIfNeeded: async () => ({ status: "skipped" }),
  resetState: () => {},
};

type TrackedTemplateState = [
  form: unknown,
  isPublished: boolean,
  name: string,
  deliveryOption: unknown,
  securityAttribute: unknown,
];

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

export function SaveTemplateProvider({ children }: { children: React.ReactNode }) {
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();
  const [, setDirtyTick] = useState(0);
  const { status } = useSession();

  const {
    getDeliveryOption,
    getId,
    getName,
    getSchema,
    hasHydrated,
    isLockedByOther,
    notificationsInterval,
    securityAttribute,
    setFromRecord,
  } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
    getId: s.getId,
    getName: s.getName,
    getSchema: s.getSchema,
    hasHydrated: s.hasHydrated,
    isLockedByOther: s.isLockedByOther,
    notificationsInterval: s.notificationsInterval,
    securityAttribute: s.securityAttribute,
    setFromRecord: s.setFromRecord,
  }));

  const templateIsDirty = useRef(false);
  const savedSnapshot = useRef<TrackedTemplateState | null>(null);
  const saveInFlight = useRef(false);
  const queuedSaveRequested = useRef(false);
  const saveDraftQueue = useRef<Array<(result: SaveDraftResult) => void>>([]);
  const resetState = useCallback(() => {
    templateIsDirty.current = false;
    savedSnapshot.current = null;
    setDirtyTick((tick) => tick + 1);
  }, []);

  const saveDraft = useCallback(async (): Promise<SaveDraftResult> => {
    if (status !== "authenticated") {
      return { status: "skipped" };
    }

    if (isLockedByOther) {
      return { status: "locked" };
    }

    const formConfig = safeJSONParse<FormProperties>(getSchema());

    if (!formConfig) {
      return { status: "invalid" };
    }

    try {
      const operationResult = await createOrUpdateTemplate({
        id: getId(),
        formConfig,
        name: getName(),
        deliveryOption: getDeliveryOption(),
        securityAttribute,
        notificationsInterval,
      });

      if (operationResult.formRecord === null) {
        return { status: operationResult.error === "editLocked" ? "locked" : "error" };
      }

      setFromRecord(operationResult.formRecord);
      setUpdatedAt(
        new Date(
          operationResult.formRecord.updatedAt ? operationResult.formRecord.updatedAt : ""
        ).getTime()
      );
      resetState();

      return { status: "saved", formId: operationResult.formRecord.id };
    } catch {
      return { status: "error" };
    }
  }, [
    getDeliveryOption,
    getId,
    getName,
    getSchema,
    isLockedByOther,
    notificationsInterval,
    resetState,
    securityAttribute,
    setFromRecord,
    status,
  ]);

  const drainQueuedSaves = useCallback(
    async (latestResult: SaveDraftResult): Promise<SaveDraftResult> => {
      if (!queuedSaveRequested.current) {
        return latestResult;
      }

      queuedSaveRequested.current = false;

      // Avoid a redundant trailing write when no additional local edits were made.
      const id = getId();
      if (!templateIsDirty.current && id !== "") {
        return drainQueuedSaves(latestResult);
      }

      const nextResult = await saveDraft();
      return drainQueuedSaves(nextResult);
    },
    [getId, saveDraft]
  );

  const queueSaveDraft = useCallback(async (): Promise<SaveDraftResult> => {
    if (saveInFlight.current) {
      queuedSaveRequested.current = true;
      return new Promise<SaveDraftResult>((resolve) => {
        saveDraftQueue.current.push(resolve);
      });
    }

    saveInFlight.current = true;
    let latestResult: SaveDraftResult = { status: "skipped" };

    try {
      latestResult = await saveDraft();
      latestResult = await drainQueuedSaves(latestResult);
      return latestResult;
    } finally {
      const waiters = saveDraftQueue.current.splice(0);
      saveInFlight.current = false;

      for (const resolve of waiters) {
        resolve(latestResult);
      }
    }
  }, [drainQueuedSaves, saveDraft]);

  const saveDraftIfNeeded = useCallback(async (): Promise<SaveDraftResult> => {
    const id = getId();
    if (!templateIsDirty.current && id !== "") {
      return { status: "skipped" };
    }

    return queueSaveDraft();
  }, [queueSaveDraft, getId]);

  useSubscibeToTemplateStore(
    (s) =>
      [
        s.form,
        s.isPublished,
        s.name,
        s.deliveryOption,
        s.securityAttribute,
      ] as TrackedTemplateState,
    (current, previous) => {
      if (!hasHydrated) {
        return;
      }

      if (savedSnapshot.current === null) {
        savedSnapshot.current = structuredClone(previous);
      }

      const isDirty = !isEqual(current, savedSnapshot.current);

      if (isDirty !== templateIsDirty.current) {
        logMessage.debug(
          `TemplateContext: ${isDirty ? "Local State out of sync with server" : "State reverted to saved"}`
        );
        templateIsDirty.current = isDirty;
        setDirtyTick((tick) => tick + 1);
      }
    }
  );

  return (
    <TemplateApiContext.Provider
      value={{
        templateIsDirty,
        updatedAt,
        setUpdatedAt,
        createOrUpdateTemplate,
        saveDraft: queueSaveDraft,
        saveDraftIfNeeded,
        resetState,
      }}
    >
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateContext = () => useContext(TemplateApiContext);
