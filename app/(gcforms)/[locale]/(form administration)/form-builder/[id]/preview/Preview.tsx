"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { PreviewNavigation } from "./PreviewNavigation";
import { getRenderedForm } from "@lib/formBuilder";
import { FormProperties, PublicFormRecord } from "@lib/types";
import { RichText } from "@clientComponents/forms";
import { ClosingNotice } from "@clientComponents/forms/ClosingNotice/ClosingNotice";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";
import { GcdsHeader } from "@serverComponents/globals/GcdsHeader/GcdsHeader";

import {
  FormServerErrorCodes,
  LocalizedElementProperties,
  LocalizedFormProperties,
} from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { BackArrowIcon } from "@serverComponents/icons";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";
import Skeleton from "react-loading-skeleton";
import { safeJSONParse } from "@lib/utils";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { toast } from "@formBuilder/components/shared/Toast";
import { defaultForm } from "@lib/store/defaults";
import { useIsFormClosed } from "@lib/hooks/useIsFormClosed";
import { PreviewFormWrapper } from "./PreviewFormWrapper";
import { BrandHeader } from "@root/components/serverComponents/globals/GcdsHeader/BrandHeader";

export const Preview = ({
  disableSubmit = true,
  allowGrouping = false,
}: {
  disableSubmit?: boolean;
  allowGrouping?: boolean;
}) => {
  const { status } = useSession();
  const { i18n } = useTranslation(["common", "confirmation"]);
  const { id, getSchema, getIsPublished, getSecurityAttribute, closingDate } = useTemplateStore(
    (s) => ({
      id: s.id,
      getSchema: s.getSchema,
      getIsPublished: s.getIsPublished,
      getSecurityAttribute: s.getSecurityAttribute,
      closingDate: s.closingDate,
    })
  );

  const isPastClosingDate = useIsFormClosed();

  const formParsed = safeJSONParse<FormProperties>(getSchema());
  if (!formParsed) {
    toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
  }

  const formRecord: PublicFormRecord = {
    id: id || "test0form00000id000asdf11",
    // TODO: refactor code to handle invalid JSON and show a helpful error message. Above will
    // show a toast to download the JSON file. But it's the default template so it will be valid
    // JSON and hide the invalid JSON that failed to parse.
    form: formParsed || defaultForm,
    isPublished: getIsPublished(),
    securityAttribute: getSecurityAttribute(),
  };

  const { localizeField, translationLanguagePriority, getLocalizationAttribute, email } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      getLocalizationAttribute: s.getLocalizationAttribute,
      email: s.deliveryOption?.emailAddress,
    }));

  const translationNamespaces = ["common", "form-builder", "form-closed"];
  const { t } = useTranslation(translationNamespaces);

  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language);

  if (!currentForm.length) {
    disableSubmit = true;
  }

  const [sent, setSent] = useState<string | null>();

  const clearSent = () => {
    setSent(null);
  };

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses`;

  const brand = formRecord?.form ? formRecord.form.brand : null;

  const hasCustom = brand?.logoEn && brand?.logoFr;

  const hasHydrated = useRehydrate();

  if (isPastClosingDate) {
    // Force a hard refresh to the preview page to show the closed message
    const refreshContent = `0;url=/${i18n.language}/form-builder/${id}/preview`;
    return (
      <>
        <meta httpEquiv="refresh" content={refreshContent} />
        <Skeleton count={4} height={40} className="mb-4" />
      </>
    );
  }

  return (
    <div className="max-w-4xl">
      <PreviewNavigation />
      <div className="h-12"></div>
      <div
        className={`mb-8 border-3 border-dashed border-blue-focus bg-white p-4 ${
          status !== "authenticated" && ""
        }`}
        {...getLocalizationAttribute()}
      >
        {status !== "authenticated" ? (
          <div className="mb-1 inline-block bg-purple-200 p-2">
            <Markdown options={{ forceBlock: true }}>
              {t("signInToTest", { ns: "form-builder", lng: language })}
            </Markdown>
          </div>
        ) : email ? (
          <div className="mb-1 inline-block bg-purple-200 p-2">
            {t("submittedResponsesText", { ns: "form-builder", email })}.
          </div>
        ) : (
          <div className="mb-1 inline-block bg-purple-200 p-2">
            {t("submittedResponsesTextVault.text1", { ns: "form-builder" })}{" "}
            <a className="visited:text-black-default" href={responsesLink}>
              {t("submittedResponsesTextVault.text2", { ns: "form-builder" })}
            </a>
            .
          </div>
        )}

        {sent && (
          <>
            <button className="clear-both mt-4 block" onClick={() => clearSent()}>
              <BackArrowIcon className="inline-block" /> {t("backToForm", { ns: "form-builder" })}
            </button>
          </>
        )}

        <div className="gc-formview gc-form-preview-header">
          {hasCustom ? (
            <BrandHeader
              brand={brand}
              pathname={""}
              language={language}
              showLanguageToggle={true}
            />
          ) : (
            <GcdsHeader pathname={""} language={language} showLanguageToggle={false} />
          )}
        </div>

        {sent ? (
          <div className="gc-formview">
            <GcdsH1 tabIndex={-1}>{t("title", { ns: "confirmation", lng: language })}</GcdsH1>
            <RichText {...getLocalizationAttribute()}>
              {formRecord.form.confirmation
                ? formRecord.form.confirmation[
                    localizeField(LocalizedElementProperties.DESCRIPTION, language)
                  ]
                : ""}
            </RichText>
          </div>
        ) : (
          <div className="gc-formview">
            {closingDate && <ClosingNotice language={language} closingDate={closingDate} />}
            <GcdsH1 className="mt-4">
              {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] ||
                t("gcFormsTest", { ns: "form-builder" })}
            </GcdsH1>
            {!hasHydrated && <Skeleton count={5} height={40} className="mb-4" />}
            {hasHydrated && (
              <GCFormsProvider formRecord={formRecord}>
                <PreviewFormWrapper
                  formRecord={formRecord}
                  disableSubmit={disableSubmit}
                  allowGrouping={allowGrouping}
                  setSent={setSent}
                >
                  {currentForm}
                </PreviewFormWrapper>
              </GCFormsProvider>
            )}
          </div>
        )}
      </div>

      {status !== "authenticated" && (
        <>
          <span className="mb-1 inline-block bg-slate-200 p-2">
            {t("confirmationPage", { ns: "form-builder" })}
          </span>
          <div className="mb-8 border-3 border-dashed border-blue-focus bg-white p-4">
            <div className="gc-formview">
              <h1 className="mt-10" tabIndex={-1}>
                {t("title", { ns: "confirmation", lng: language })}
              </h1>
              <RichText {...getLocalizationAttribute()}>
                {formRecord.form.confirmation
                  ? formRecord.form.confirmation[
                      localizeField(LocalizedElementProperties.DESCRIPTION, language)
                    ]
                  : ""}
              </RichText>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
