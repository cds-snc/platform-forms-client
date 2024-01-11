import React, { createContext, useState, useContext, useRef, useCallback } from "react";
import { useTemplateStore, useSubscibeToTemplateStore } from "../store";
import { useTemplateApi } from "../hooks";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";
import { useSession } from "next-auth/react";
import { toast } from "../app/shared/Toast";
import { StyledLink } from "@components/globals";
import { DownloadFileButton } from "../app/shared/";

interface TemplateApiType {
  error: string | null | undefined;
  saveForm: () => Promise<boolean>;
  templateIsDirty: React.MutableRefObject<boolean>;
}

const defaultTemplateApi: TemplateApiType = {
  error: null,
  saveForm: async () => false,
  templateIsDirty: { current: false },
};

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

const ErrorSaving = ({ supportHref, errorCode }: { supportHref: string; errorCode?: string }) => {
  const { t } = useTranslation("form-builder");

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("errorSavingForm.title")}</h3>
      <p className="mb-2 text-black">
        {t("errorSavingForm.description")}{" "}
        <StyledLink href={supportHref}>{t("errorSavingForm.supportLink")}.</StyledLink>
      </p>
      <p className="mb-5 text-sm text-black">
        {errorCode && t("errorSavingForm.errorCode", { code: errorCode })}
      </p>
      <DownloadFileButton theme="primary" showInfo={false} autoShowDialog={false} />
    </div>
  );
};

export function TemplateApiProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation(["form-builder"]);
  const [error, setError] = useState<string | null>();
  const supportHref = `/${i18n.language}/form-builder/support`;
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

  const saveForm = useCallback(async () => {
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
      return true;
    } catch (err) {
      logMessage.error(err as Error);
      setError(t("errorSaving"));
      toast.error(<ErrorSaving supportHref={supportHref} />, "wide");
      return false;
    }
  }, [status, getIsPublished, getSchema, getName, id, save, setError, setId, t, supportHref]);

  return (
    <TemplateApiContext.Provider value={{ error, saveForm, templateIsDirty }}>
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateContext = () => useContext(TemplateApiContext);
