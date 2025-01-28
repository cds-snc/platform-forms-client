"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { RichText } from "@clientComponents/forms";
import { getProperty } from "@lib/i18nHelpers";
import { PublicFormRecord } from "@lib/types";
import { ClosedFormIcon } from "@serverComponents/icons";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { BackArrowIcon } from "@serverComponents/icons";

/*
  This is the component for text pages within the form flow (start pages, end pages)
*/

interface TextPageProps {
  formRecord: PublicFormRecord;
  language: "en" | "fr";
  isPreview: boolean;
}

interface PageContextProps {
  title: string | undefined;
  pageText: string;
  language: "en" | "fr";
}

const PageContent = ({ title, language, pageText }: PageContextProps) => {
  const { t } = useTranslation("form-closed");
  // Check if there's a custom text for the end page specified in the form's JSON config
  if (pageText && pageText !== undefined) {
    return (
      <>
        {/* Ensure a default h1 for a11y */}
        <ClosedHeading language={language} />
        <RichText>{pageText}</RichText>
      </>
    );
  }

  const formName = title ? title : t("defaultFormName", { ns: "form-closed", lng: language });

  return (
    <>
      <ClosedHeading language={language} />
      <div>
        <p>
          {t("body1", { ns: "form-closed", lng: language })} {formName}
          {t("body2", { ns: "form-closed", lng: language })}
        </p>
      </div>
    </>
  );
};

const ClosedHeading = ({ language }: { language: "en" | "fr" }) => {
  const { t } = useTranslation("form-closed");
  return (
    <h1 tabIndex={-1} className="!mb-6 border-none">
      <span>
        <ClosedFormIcon className="mr-5 mt-[-5px] inline-block" />{" "}
        {t("title", { ns: "form-closed", lng: language })}
      </span>
    </h1>
  );
};

export const ClosedPage = (props: TextPageProps): React.ReactElement => {
  const { t } = useTranslation("form-closed");

  const {
    formRecord: {
      form: { titleEn, titleFr, closedMessage, brand },
      closedDetails,
    },
    language,
    isPreview,
  } = props;

  let homeHref = "https://canada.ca";

  if (brand && brand.urlEn && brand.urlFr) {
    homeHref = language === "en" ? brand.urlEn : brand.urlFr;
  }

  // Check for legacy closedMessage field
  let pageText = closedMessage
    ? (closedMessage[getProperty("description", language)] as string)
    : "";

  // If the page text is empty, look for a custom closed message
  if (pageText === "" && closedDetails) {
    const message = closedDetails[getProperty("message", language) as keyof typeof closedDetails];
    pageText = message ? message : pageText;
  }

  const target = isPreview ? "_blank" : "_self";

  // autoFocus h1 element of page to ensure its read out
  useEffect(() => {
    document.getElementsByTagName("h1").item(0)?.focus();
  });

  return (
    <div className="mx-2 mb-36">
      <div className="mb-10 rounded-md border-1 border-blue-dark bg-gray-soft p-10">
        <PageContent
          language={language}
          title={language === "en" ? titleEn : titleFr}
          pageText={pageText}
        />
      </div>
      <LinkButton.Primary href={homeHref} target={target} className="mb-2 mr-3">
        <span>
          <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
          {t("backButton")}
        </span>
      </LinkButton.Primary>
    </div>
  );
};
