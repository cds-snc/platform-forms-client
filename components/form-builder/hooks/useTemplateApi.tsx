import React, { createContext, useState, useContext } from "react";
import { useTemplateStore } from "../store";
import { usePublish } from "../hooks";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";

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
  const { id, getSchema, getName, getDeliveryOption } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
    getName: s.getName,
    getDeliveryOption: s.getDeliveryOption,
  }));

  const { uploadJson } = usePublish();

  const saveForm = async () => {
    try {
      const result = await uploadJson(getSchema(), getName(), getDeliveryOption(), id);

      if (result && result?.error) {
        throw result?.error as Error;
      }

      setError(null);
      return result?.id;
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

export const useTemplateApi = () => useContext(TemplateApiContext);
