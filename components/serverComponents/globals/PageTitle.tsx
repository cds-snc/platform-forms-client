"use client";
import { useTranslation } from "@i18n";

export const PageTitle = ({ key, namespace }: { key: string; namespace: string }) => {
  const { t } = useTranslation(namespace);
  return <title>{t(key)}</title>;
};
