"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";

import { PreviewNavigation } from "./PreviewNavigation";
import { getRenderedForm } from "@lib/formBuilder";
import { PublicFormRecord } from "@lib/types";
import { Button, RichText, ClosedPage, NextButton } from "@clientComponents/forms";
import { LocalizedElementProperties, LocalizedFormProperties } from "@lib/types/form-builder-types";
import { useRehydrate, useTemplateStore } from "@lib/store/useTemplateStore";
import { BackArrowIcon } from "@serverComponents/icons";
import Brand from "@clientComponents/globals/Brand";
import { useIsFormClosed } from "@lib/hooks/useIsFormClosed";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";
import Skeleton from "react-loading-skeleton";
import { Form } from "@clientComponents/forms/Form/Form";
import { BackButton } from "./BackButton";

export const Preview = ({
  disableSubmit = true,
  allowGrouping = false,
}: {
  disableSubmit?: boolean;
  allowGrouping?: boolean;
}) => {
  const { status } = useSession();
  const { i18n } = useTranslation(["common", "confirmation"]);
  const { id, getSchema, getIsPublished, getSecurityAttribute } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
    getIsPublished: s.getIsPublished,
    getSecurityAttribute: s.getSecurityAttribute,
  }));

  const formRecord: PublicFormRecord = {
    id: id || "test0form00000id000asdf11",
    form: JSON.parse(getSchema()),
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

  const { t } = useTranslation(["common", "form-builder"]);
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language);

  if (!currentForm.length) {
    disableSubmit = true;
  }

  const [sent, setSent] = useState<string | null>();

  const clearSent = () => {
    setSent(null);
  };

  const preventSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    return false;
  };

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses/new`;
  const settingsLink = `/${i18n.language}/form-builder/${id}/settings`;

  const brand = formRecord?.form ? formRecord.form.brand : null;

  const isPastClosingDate = useIsFormClosed();

  const hasHydrated = useRehydrate();

  if (isPastClosingDate) {
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
          <div className="gc-formview">
            <div className="mb-20 mt-0 border-b-4 border-blue-dark py-9">
              <Brand brand={brand} lang={language} className="max-w-[360px]" />
            </div>
            <ClosedPage language={language} formRecord={formRecord} />
          </div>
        </div>
      </div>
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
            <h1 tabIndex={-1}>{t("title", { ns: "confirmation" })}</h1>
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
                            validateForm={validateForm}
                            fallBack={() => {
                              return (
                                <>
                                  {allowGrouping && <BackButton />}
                                  <Button
                                    type="submit"
                                    id="SubmitButton"
                                    className="mb-4"
                                    onClick={(e) => {
                                      if (disableSubmit) {
                                        return preventSubmit(e);
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
              <h1 tabIndex={-1}>{t("title", { ns: "confirmation" })}</h1>
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
