"use client";

import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { useTranslation } from "@i18n/client";

export const NoFileSystemAccess = () => {
  const { t } = useTranslation("response-legacy");
  return (
    <ErrorPanel headingTag="h1" title={t("not-supported.title")}>
      <p>{t("not-supported.body")}</p>
    </ErrorPanel>
  );
};
