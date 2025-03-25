"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { RichText } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { PublicFormRecord } from "@lib/types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { SaveResponse } from "@clientComponents/forms/SaveAndResume/SaveResponse";
import { Language } from "@lib/types/form-builder-types";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";

/*
  This is the component for text pages within the form flow (start pages, end pages)
*/

interface TextPageProps {
  formId: string;
  formRecord: PublicFormRecord;
}

interface PageContextProps {
  formId: string;
  formRecord: PublicFormRecord;
  pageText: string;
  urlQuery: string | null;
  language: Language;
}

const PageContent = ({ formRecord, pageText, urlQuery, language }: PageContextProps) => {
  const { t } = useTranslation("confirmation");
  const { submissionId, submissionDate } = useGCFormsContext();

  const { getFlag } = useFeatureFlags();
  const saveAndResumeEnabled = getFlag(FeatureFlags.saveAndResume);
  const saveAndResume = formRecord?.saveAndResume && saveAndResumeEnabled;

  // Check if there's a custom text for the end page specified in the form's JSON config
  if (pageText && pageText !== undefined) {
    return (
      <>
        <input type="hidden" value={submissionId} name="submissionId" />
        <input type="hidden" value={submissionDate} name="submissionDate" />
        <RichText className="confirmation">{pageText}</RichText>
        {saveAndResume && <SaveResponse language={language} />}
      </>
    );
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
      <GcdsH1 tabIndex={-1}>{t("title")}</GcdsH1>
      <PageContent
        formId={props.formId}
        formRecord={props.formRecord}
        language={language as Language}
        pageText={pageText}
        urlQuery={urlQuery}
      />
    </>
  );
};
