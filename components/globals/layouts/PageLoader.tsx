import { useTemplateStore } from "@components/form-builder/store";
import { Language } from "@components/form-builder/types";
import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";

export const PageLoader = ({ page }: { page: ReactElement }) => {
  const { t, i18n } = useTranslation("form-builder");

  const { hasHydrated, setLang } = useTemplateStore((s) => ({
    hasHydrated: s.hasHydrated,
    setLang: s.setLang,
  }));

  const locale = i18n.language as Language;
  useEffect(() => {
    setLang(locale);
  }, [locale, setLang]);

  return hasHydrated ? <>{page}</> : <Loader message="" />;
};
