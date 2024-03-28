import React from "react";
import { SecurityAttribute } from "@lib/types";
import { customTranslate } from "../../../i18nHelpers";

export const ProtectedLevel = ({
  securityAttribute,
  lang,
}: {
  securityAttribute: SecurityAttribute;
  lang: string;
}) => {
  const { t } = customTranslate("my-forms");

  const renderSecurityAttribute = () => {
    switch (securityAttribute) {
      case "Unclassified":
        return t("dataClassification.unclassified", { lng: lang });
      case "Protected A":
        return t("dataClassification.protectedA", { lng: lang });
      case "Protected B":
        return t("dataClassification.protectedB", { lng: lang });
    }
  };

  // Note: "self-start" for case of embedding in flex container, stops vertically stretching
  return (
    <div className="self-start whitespace-nowrap border border-gray-300 bg-white px-4 py-2 font-bold rounded">
      {renderSecurityAttribute().toUpperCase()}
    </div>
  );
};
