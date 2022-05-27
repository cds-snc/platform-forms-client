import React, { useEffect } from "react";
import parse from "html-react-parser";
import { useTranslation } from "next-i18next";
import { RichText } from "../../../components/forms";
import { getProperty } from "@lib/formBuilder";
import { PublicFormRecord } from "@lib/types";

/*
  This is the component for text pages within the form flow (start pages, end pages)
*/

interface TextPageProps {
  formRecord: PublicFormRecord;
  htmlEmail: string | undefined;
}

interface PageContextProps {
  pageText: string;
  urlQuery: string | null;
}

const PageContent = ({ pageText, urlQuery }: PageContextProps) => {
  // Check if there's a custom text for the end page specified in the form's JSON config
  if (pageText && pageText !== undefined) {
    return <RichText className="confirmation">{pageText}</RichText>;
  }

  const { t } = useTranslation("confirmation");

  // Otherwise, display the default confirmation text
  const backToLink = urlQuery ? <a href={urlQuery}>{t("backLink")}</a> : null;
  return (
    <>
      <h1 className="gc-h1" tabIndex={-1}>
        {t("title")}
      </h1>
      <div>
        <p>{t("body")}</p>
      </div>
      <div className="gc-form-confirmation">{backToLink}</div>
    </>
  );
};

export const TextPage = (props: TextPageProps): React.ReactElement => {
  const { i18n } = useTranslation("confirmation");
  const {
    formRecord: {
      formConfig: {
        form: { endPage },
      },
    },
    htmlEmail,
  } = props;
  const language = i18n.language as string;

  const pageText = endPage ? endPage[getProperty("description", language)] : "";

  const urlQuery = endPage ? endPage[getProperty("referrerUrl", language)] : null;

  // autoFocus h1 element of page to ensure its read out
  useEffect(() => {
    document.getElementsByTagName("h1").item(0)?.focus();
  });

  return (
    <>
      <PageContent pageText={pageText} urlQuery={urlQuery} />

      {htmlEmail && (
        <div className="p-5 mt-5 border-double border-gray-400 border-4">
          <h2>Email to Form Owner Below:</h2>
          <div className="pt-5 email-preview">{parse(htmlEmail)}</div>
        </div>
      )}
    </>
  );
};

export default TextPage;
