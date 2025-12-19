import React from "react";
import { SecurityAttribute } from "@lib/types";
import { TFunction } from "i18next";

interface ProtectedWarningProps {
  securityAttribute: SecurityAttribute;
  lang: string;
  t: TFunction<string | string[], undefined>;
}

export const ProtectedWarning = (props: ProtectedWarningProps) => {
  const { lang, t } = props;

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
    <div className="flex items-center justify-between border border-gray-300 bg-gray-200 p-4 text-lg">
      <div className="flex flex-col">
        <strong className="!mb-2 !font-bold">
          {t("dataClassification.officialRecord", { lng: lang })}{" "}
        </strong>
        <p className="!mb-2">{t("dataClassification.retainCopy", { lng: lang })}</p>
      </div>
      <div className="border border-gray-300 bg-white px-4 py-2 font-bold">
        {renderSecurityAttribute().toUpperCase()}
      </div>
    </div>
  );
};
