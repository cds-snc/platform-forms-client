"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { RichText } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { PublicFormRecord } from "@lib/types";

/*
  This is the component for text pages within the form flow (start pages, end pages)
*/

interface TextPageProps {
  formRecord: PublicFormRecord;
}

interface PageContextProps {
  pageText: string;
  urlQuery: string | null;
}

const PageContent = ({ pageText, urlQuery }: PageContextProps) => {
  const { t } = useTranslation("confirmation");

  // Check if there's a custom text for the end page specified in the form's JSON config
  if (pageText && pageText !== undefined) {
    return <RichText className="confirmation">{pageText}</RichText>;
  }

  // Otherwise, display the default confirmation text
  const backToLink = urlQuery ? <a href={urlQuery}>{t("backLink")}</a> : null;
  return (
    <>
      <div>
        <p>{t("body")}</p>
      </div>
      <div className="gc-form-confirmation">{backToLink}</div>
    </>
  );
};

export const TextPage = (props: TextPageProps): React.ReactElement => {
  const { i18n } = useTranslation("confirmation");
  const { t } = useTranslation("confirmation");
  const {
    formRecord: {
      form: { confirmation },
    },
  } = props;
  const language = i18n.language as string;

  const pageText = confirmation ? confirmation[getLocalizedProperty("description", language)] : "";

  const urlQuery = confirmation
    ? confirmation[getLocalizedProperty("referrerUrl", language)]
    : null;

  // autoFocus h1 element of page to ensure its read out
  useEffect(() => {
    document.getElementsByTagName("h1").item(0)?.focus();
  });

  return (
    <>
      <h1 tabIndex={-1}>{t("title")}</h1>
      <PageContent pageText={pageText} urlQuery={urlQuery} />
    </>
  );
};
