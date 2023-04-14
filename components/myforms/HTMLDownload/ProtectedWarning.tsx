import React from "react";
import { useTranslation } from "next-i18next";
import { SecurityAttribute } from "@lib/types";

// Note: use lang prop if you want to force a specific language e.g. HTMLDownload component
interface ProtectedWarningProps {
  securityAttribute: SecurityAttribute;
  lang?: string;
}

export const ProtectedWarning = (props: ProtectedWarningProps) => {
  const { t, i18n } = useTranslation(["my-forms"]);
  const { lang = i18n.language } = props;

  const renderSecurityAttribute = () => {
    switch (props.securityAttribute) {
      case "Unclassified":
        return t("dataClassification.unclassified", { lng: lang });
      case "Protected A":
        return t("dataClassification.protectedA", { lng: lang });
      case "Protected B":
        return t("dataClassification.protectedB", { lng: lang });
    }
  };

  return (
    <div className="flex p-4 justify-between items-center bg-gray-200 border border-gray-300 text-sm">
      <div className="flex flex-col">
        <p className="font-bold">{t("dataClassification.officialRecord", { lng: lang })}</p>
        <p>{t("dataClassification.retainCopy", { lng: lang })}</p>
      </div>
      <div className="px-4 py-2 bg-white-default font-bold border border-gray-300">
        {renderSecurityAttribute()}
      </div>
    </div>
  );
};
