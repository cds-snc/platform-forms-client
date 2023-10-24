import React from "react";
import { useTranslation } from "react-i18next";

// SkipLink also exists but is used in Forms-Forms. This component was created for the Form-builder
// -Default Heading example: <SkipLinkFormBuilder />
// -Custom example: <SkipLinkFormBuilder text={t("downloadResponsesTable.skipLink")} anchor="#downloadTableButtonId" />
export const SkipLinkFormBuilder = ({
  text,
  anchor = "#pageHeading",
}: {
  text?: string;
  anchor?: string;
}) => {
  const { t } = useTranslation("common");
  const content = text || t("skip-link");

  return (
    <div className="w-full absolute z-5 text-center top-2.5">
      <a
        href={anchor}
        className={
          "absolute overflow-hidden w-1 h-1 whitespace-nowrap focus:static focus:p-1.5 focus:w-auto focus:h-auto focus:overflow-auto focus:text-center"
        }
      >
        {content}
      </a>
    </div>
  );
};
