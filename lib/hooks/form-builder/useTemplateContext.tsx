"use client";
import React, { createContext, useState, useContext, useRef, useCallback } from "react";
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

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

type TrackedState = [
  form: unknown,
  isPublished: boolean,
  name: string,
  deliveryOption: unknown,
  securityAttribute: unknown,
];

export function SaveTemplateProvider({ children }: { children: React.ReactNode }) {
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();
  // Tick state to force re-renders when templateIsDirty (a ref) changes.
  // Without this, setting the ref alone won't cause SaveButton to re-read it.
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

  // Snapshot of tracked state at last save (or initial load).
  // Deep-compared against current state to detect real changes.
  const savedSnapshot = useRef<TrackedState | null>(null);

  const resetState = useCallback(() => {
    templateIsDirty.current = false;
    savedSnapshot.current = null; // Snapshot is captured on next subscription fire
    setDirtyTick((t) => t + 1);
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

      return { status: "saved" };
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

  const saveDraftIfNeeded = useCallback(async (): Promise<SaveDraftResult> => {
    if (!templateIsDirty.current) {
      return { status: "skipped" };
    }

    return saveDraft();
  }, [saveDraft]);

  // Single subscription — uses deep equality (lodash.isequal) to compare
  // current state against the last-saved snapshot. This means changing a
  // value and changing it back results in dirty = false.
  useSubscibeToTemplateStore(
    (s) => [s.form, s.isPublished, s.name, s.deliveryOption, s.securityAttribute] as TrackedState,
    (current, previous) => {
      if (!hasHydrated) return;

      // Capture the pre-change state as the snapshot on first fire after mount or save
      if (savedSnapshot.current === null) {
        savedSnapshot.current = structuredClone(previous);
      }

      const dirty = !isEqual(current, savedSnapshot.current);

      if (dirty !== templateIsDirty.current) {
        logMessage.debug(
          `TemplateContext: ${dirty ? "Local State out of sync with server" : "State reverted to saved"}`
        );
        templateIsDirty.current = dirty;
        setDirtyTick((t) => t + 1);
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
        saveDraft,
        saveDraftIfNeeded,
        resetState,
      }}
    >
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateContext = () => useContext(TemplateApiContext);
