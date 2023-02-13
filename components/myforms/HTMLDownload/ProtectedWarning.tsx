import React from "react";
import { useTranslation } from "next-i18next";

// Note: use lang prop if you want to force a specific language e.g. HTMLDownload component
interface ProtectedWarningProps {
  lang?: string;
}

export const ProtectedWarning = (props: ProtectedWarningProps) => {
  const { t, i18n } = useTranslation(["my-forms"]);
  const { lang = i18n.language } = props;
  return (
    <div className="flex p-4 justify-between items-center bg-gray-200 border border-gray-300 text-sm">
      <div className="flex flex-col">
        <p className="font-bold">{t("protectedBWarning.officialRecord", { lng: lang })}</p>
        <p>{t("protectedBWarning.retainCopy", { lng: lang })}</p>
      </div>
      <div className="px-4 py-2 bg-white-default font-bold border border-gray-300">
        {t("protectedBWarning.protectedB", { lng: lang })}
      </div>
    </div>
  );
};
