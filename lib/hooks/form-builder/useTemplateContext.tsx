"use client";
import React, { createContext, useState, useContext, useRef } from "react";
import { useTemplateStore, useSubscibeToTemplateStore } from "../../store";
import { logMessage } from "@lib/logger";
import { CreateOrUpdateTemplateType, createOrUpdateTemplate } from "@formBuilder/actions";
import { PublicFormRecord } from "@lib/types";

interface TemplateApiType {
  templateIsDirty: React.MutableRefObject<boolean>;
  nameChanged: boolean | null;
  introChanged: boolean | null;
  privacyChanged: boolean | null;
  confirmationChanged: boolean | null;
  createOrUpdateTemplate:
    | (({
        id,
        formConfig,
        name,
        deliveryOption,
        securityAttribute,
      }: CreateOrUpdateTemplateType) => Promise<PublicFormRecord>)
    | null;
  lastChange: number;
}

const defaultTemplateApi: TemplateApiType = {
  templateIsDirty: { current: false },
  nameChanged: null,
  introChanged: null,
  privacyChanged: null,
  confirmationChanged: null,
  createOrUpdateTemplate: null,
  lastChange: new Date().getTime(),
};

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

interface Description {
  descriptionEn: string | undefined;
  descriptionFr: string | undefined;
}

const descriptionsMatch = (
  obj: Description | Record<string, string> | undefined,
  obj2: Description | Record<string, string> | undefined
) => {
  let en = true;
  let fr = true;

  if (!obj || !obj2) {
    return false;
  }

  if (obj.descriptionEn && obj2.descriptionEn) {
    en = obj.descriptionEn === obj2.descriptionEn;
  }

  if (obj.descriptionFr && obj2.descriptionFr) {
    fr = obj.descriptionFr === obj2.descriptionFr;
  }

  return en && fr;
};

export function SaveTemplateProvider({ children }: { children: React.ReactNode }) {
  const [nameChanged, setNameChanged] = useState<boolean | null>(false);
  const [introChanged, setIntroChanged] = useState<boolean | null>(false);
  const [privacyChanged, setPrivacyChanged] = useState<boolean | null>(false);
  const [confirmationChanged, setConfirmationChanged] = useState<boolean | null>(false);

  const { hasHydrated } = useTemplateStore((s) => ({
    hasHydrated: s.hasHydrated,
  }));

  const [lastChange, setLastChange] = useState(new Date().getTime());
  const templateIsDirty = useRef(false);

  useSubscibeToTemplateStore(
    (s) => [s.form, s.isPublished, s.name, s.deliveryOption, s.securityAttribute],
    () => {
      if (hasHydrated && !templateIsDirty.current) {
        logMessage.debug(`TemplateContext: Local State out of sync with server`);
        templateIsDirty.current = true;
      }
      setLastChange(new Date().getTime());
    }
  );

  useSubscibeToTemplateStore(
    (s) => [s.getName() ?? ""],
    (s, p) => {
      if (p[0] !== s[0]) {
        setNameChanged(true);
        setLastChange(new Date().getTime());
      }
    }
  );

  useSubscibeToTemplateStore(
    (s) => [s.form.introduction, s.form.privacyPolicy, s.form.confirmation],
    (s, p) => {
      // look for changes in the descriptions
      // if changes update the state to ensure the provider
      // updates the save button
      const introduction = descriptionsMatch(s[0], p[0]);
      const privacyPolicy = descriptionsMatch(s[1], p[1]);
      const confirmation = descriptionsMatch(s[2], p[2]);

      if (introduction !== introChanged) {
        setIntroChanged(introduction);
        setLastChange(new Date().getTime());
      }

      if (privacyPolicy !== privacyChanged) {
        setPrivacyChanged(privacyPolicy);
        setLastChange(new Date().getTime());
      }

      if (confirmation !== confirmationChanged) {
        setConfirmationChanged(confirmation);
        setLastChange(new Date().getTime());
      }
    }
  );

  return (
    <TemplateApiContext.Provider
      value={{
        templateIsDirty,
        nameChanged,
        introChanged,
        privacyChanged,
        confirmationChanged,
        createOrUpdateTemplate,
        lastChange,
      }}
    >
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateContext = () => useContext(TemplateApiContext);
