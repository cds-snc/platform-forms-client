"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { PreviewNavigation } from "./PreviewNavigation";
import { getRenderedForm } from "@lib/formBuilder";
import { FormProperties, PublicFormRecord } from "@lib/types";
import { RichText } from "@clientComponents/forms";
import { Button } from "@clientComponents/globals";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { ClosingNotice } from "@clientComponents/forms/ClosingNotice/ClosingNotice";

import {
  FormServerErrorCodes,
  LocalizedElementProperties,
  LocalizedFormProperties,
} from "@lib/types/form-builder-types";
import { useRehydrate, useTemplateStore } from "@lib/store/useTemplateStore";
import { BackArrowIcon } from "@serverComponents/icons";
import Brand from "@clientComponents/globals/Brand";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";
import Skeleton from "react-loading-skeleton";
import { Form } from "@clientComponents/forms/Form/Form";
import { BackButton } from "./BackButton";
import { safeJSONParse } from "@lib/utils";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { toast } from "@formBuilder/components/shared/Toast";
import { defaultForm } from "@lib/store/defaults";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { focusElement } from "@lib/client/clientHelpers";
import { useIsFormClosed } from "@lib/hooks/useIsFormClosed";

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

  const { t } = useTranslation(["common", "form-builder", "form-closed"]);
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language);

  if (!currentForm.length) {
    disableSubmit = true;
  }

  const [sent, setSent] = useState<string | null>();

  const clearSent = () => {
    setSent(null);
  };

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses/new`;
  const settingsLink = `/${i18n.language}/form-builder/${id}/settings`;

  const brand = formRecord?.form ? formRecord.form.brand : null;

  const hasHydrated = useRehydrate();

  const isShowReviewPage = showReviewPage(formRecord.form);

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
            {t("submittedResponsesText", { ns: "form-builder", email })}{" "}
            <a className="visited:text-black-default" href={settingsLink}>
              {t("submittedResponsesChange", { ns: "form-builder" })}
            </a>
            .
          </div>
        ) : (
          <div className="mb-1 inline-block bg-purple-200 p-2">
            {t("submittedResponsesTextVault.text1", { ns: "form-builder" })}{" "}
            <a className="visited:text-black-default" href={responsesLink}>
              {t("submittedResponsesTextVault.text2", { ns: "form-builder" })}
            </a>
            .{" "}
            <a className="visited:text-black-default" href={settingsLink}>
              {t("submittedResponsesChange", { ns: "form-builder" })}
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

        <div className="gc-formview">
          <div className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
            <Brand brand={brand} lang={language} className="max-w-[360px]" />
          </div>
        </div>

        {sent ? (
          <div className="gc-formview">
            <h1 tabIndex={-1}>{t("title", { ns: "confirmation", lng: language })}</h1>
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
            <h1 className="mt-4">
              {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] ||
                t("gcFormsTest", { ns: "form-builder" })}
            </h1>
            {!hasHydrated && <Skeleton count={5} height={40} className="mb-4" />}
            {hasHydrated && (
              <GCFormsProvider formRecord={formRecord}>
                <Form
                  formRecord={formRecord}
                  isPreview={true}
                  language={language}
                  t={t}
                  onSuccess={setSent}
                  renderSubmit={({ validateForm }) => {
                    return (
                      <div id="PreviewSubmitButton">
                        <span {...getLocalizationAttribute()}>
                          <NextButton
                            formRecord={formRecord}
                            language={language}
                            validateForm={validateForm}
                            fallBack={() => {
                              return (
                                <>
                                  {allowGrouping && isShowReviewPage && (
                                    <BackButton
                                      language={language}
                                      onClick={() => focusElement("h2")}
                                    />
                                  )}
                                  <Button
                                    type="submit"
                                    id="SubmitButton"
                                    className="mb-4"
                                    onClick={(e) => {
                                      if (disableSubmit) {
                                        e.preventDefault();
                                      }
                                    }}
                                  >
                                    {t("submitButton", { ns: "common", lng: language })}
                                  </Button>
                                </>
                              );
                            }}
                          />
                        </span>
                        {status !== "authenticated" && (
                          <div
                            className="inline-block bg-purple-200 px-4 py-1"
                            {...getLocalizationAttribute()}
                          >
                            <Markdown options={{ forceBlock: true }}>
                              {t("signInToTest", { ns: "form-builder", lng: language })}
                            </Markdown>
                          </div>
                        )}
                      </div>
                    );
                  }}
                  allowGrouping={allowGrouping}
                >
                  {currentForm}
                </Form>
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
