import React, { createContext, useState, useContext } from "react";
import { useTemplateStore } from "../store";
import { usePublish } from "../hooks";
import { useTranslation } from "next-i18next";

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
  const { getSchema, id } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
  }));

  const { uploadJson } = usePublish();

  const saveForm = async () => {
    try {
      const schema = JSON.parse(getSchema());
      delete schema.id;
      delete schema.isPublished;

      const result = await uploadJson(JSON.stringify(schema), id);

      if (result && result?.error) {
        throw new Error();
      }

      setError(null);
      return result?.id;
    } catch (err) {
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
