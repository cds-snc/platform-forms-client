import React from "react";
import { SecurityAttribute } from "@lib/types";
import { customTranslate } from "../../helpers";

interface ProtectedWarningProps {
  securityAttribute: SecurityAttribute;
  lang: string;
}

export const ProtectedWarning = (props: ProtectedWarningProps) => {
  const { lang } = props;
  const { t } = customTranslate("my-forms");

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
        <p className="font-bold">{t("dataClassification.officialRecord", { lng: lang })} </p>
        <p>{t("dataClassification.retainCopy", { lng: lang })}</p>
      </div>
      <div className="border border-gray-300 bg-white px-4 py-2 font-bold">
        {renderSecurityAttribute().toUpperCase()}
      </div>
    </div>
  );
};
