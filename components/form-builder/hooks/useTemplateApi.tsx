import React, { createContext, useState, useContext } from "react";
import { useTemplateStore } from "../store";
import { usePublish } from "../hooks";
import { useTranslation } from "next-i18next";

interface TemplateApiType {
  error: string;
  saveForm: () => Promise<string | false>;
}

const defaultTemplateApi: TemplateApiType = {
  error: "",
  saveForm: async () => new Promise((resolve) => resolve(false)),
};

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

export function TemplateApiProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(["form-builder"]);
  const [error, setError] = useState<string>("");
  const { uploadJson } = usePublish();
  const { getSchema, id } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
  }));

  const saveForm = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);
    if (result && result?.error) {
      setApiError(t("errorSaving"));
      return false;
    }

    setApiError();
    return result?.id;
  };

  const setApiError = (title = "") => {
    setError(title);
  };

  return (
    <TemplateApiContext.Provider value={{ error, saveForm }}>
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateApi = () => useContext(TemplateApiContext);
