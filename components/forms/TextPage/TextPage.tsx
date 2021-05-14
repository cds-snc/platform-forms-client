import React from "react";
import parse from "html-react-parser";
import { useTranslation } from "next-i18next";
import { RichText } from "../../../components/forms";
import { FormMetadataProperties } from "../../../lib/types";
import { TFunction } from "next-i18next";
import { getProperty } from "../../../lib/formBuilder";

/*
  This is the component for text pages within the form flow (start pages, end pages)
*/

interface TextPageProps {
  formMetadata: FormMetadataProperties;
  htmlEmail: string | undefined;
  urlQuery: string | undefined;
  step: string | string[] | undefined;
}

const getPageContent = (t: TFunction, pageText: string, urlQuery: string | undefined) => {
  // Check if there's a custom text for the end page specified in the form's JSON config
  if (pageText && pageText !== undefined) {
    return <RichText className="confirmation">{pageText}</RichText>;
  }

  // Otherwise, display the default confirmation text
  const backToLink = urlQuery ? <a href={urlQuery}>{t("backLink")}</a> : null;
  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div>
        <p>{t("body")}</p>
      </div>
      <div className="gc-form-confirmation">{backToLink}</div>
    </>
  );
};

export const TextPage = (props: TextPageProps): React.ReactElement => {
  const { t, i18n } = useTranslation("confirmation");
  const { urlQuery, htmlEmail, formMetadata } = props;
  const language = i18n.language as string;

  const pageText =
    formMetadata && formMetadata.endPage
      ? formMetadata.endPage[getProperty("description", language)]
      : "";

  return (
    <>
      {getPageContent(t, pageText, urlQuery)}

      {htmlEmail ? (
        <div className="p-5 mt-5 border-double border-gray-400 border-4">
          <h2>Email to Form Owner Below:</h2>
          <div className="pt-5 email-preview">{parse(htmlEmail)}</div>
        </div>
      ) : null}
    </>
  );
};

export default TextPage;
