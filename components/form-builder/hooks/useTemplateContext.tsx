import React, { createContext, useState, useContext, useRef } from "react";
import { useTemplateStore, useSubscibeToTemplateStore } from "../store";
import { useTemplateApi } from "../hooks";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";

interface TemplateApiType {
  error: string | null;
  saveForm: () => Promise<string | false>;
}

const defaultTemplateApi: TemplateApiType = {
  error: null,
  saveForm: async () => new Promise((resolve) => resolve(false)),
};

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

export function TemplateApiProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(["form-builder"]);
  const [error, setError] = useState<string | null>(null);
  const { id, getSchema, getName, hasHydrated, setId, getIsPublished } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
    getName: s.getName,
    hasHydrated: s.hasHydrated,
    setId: s.setId,
    getIsPublished: s.getIsPublished,
  }));

  const templateIsDirty = useRef(false);

  const { status } = useSession();

  useSubscibeToTemplateStore(
    (s) => [s.form, s.isPublished, s.name, s.deliveryOption, s.securityAttribute],
    () => {
      if (hasHydrated && !templateIsDirty.current) {
        logMessage.debug(`TemplateContext: Local State out of sync with server`);
        templateIsDirty.current = true;
      }
    }
  );

  const { save } = useTemplateApi();

  const saveForm = async () => {
    try {
      if (templateIsDirty.current && status === "authenticated" && !getIsPublished()) {
        logMessage.debug("Saving Template to server");
        const result = await save({
          jsonConfig: getSchema(),
          name: getName(),
          formID: id,
        });

        if (result && result?.error) {
          throw result?.error as Error;
        }

        setError(null);
        templateIsDirty.current = false;
        setId(result?.id);
      }
    } catch (err) {
      logMessage.error(err as Error);
      setError(t("errorSaving"));
      return false;
    }
  };

  return (
    <TemplateApiContext.Provider value={{ error, saveForm }}>
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateContext = () => useContext(TemplateApiContext);
