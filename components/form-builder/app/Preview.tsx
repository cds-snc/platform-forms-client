import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";

import { getRenderedForm } from "@lib/formBuilder";
import { PublicFormRecord } from "@lib/types";
import { Button, Form, RichText } from "@components/forms";
import { LocalizedElementProperties, LocalizedFormProperties } from "../types";
import { useTemplateStore } from "../store";
import { BackArrowIcon } from "../icons";
import Brand from "@components/globals/Brand";

export const Preview = () => {
  const { status } = useSession();
  const { i18n } = useTranslation("common");
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

  const router = useRouter();

  const { t } = useTranslation(["common", "form-builder"]);
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language, t);
  const [sent, setSent] = useState<string | null>();

  const clearSent = () => {
    setSent(null);
  };

  const preventSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    return false;
  };

  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;
  const settingsLink = `/${i18n.language}/form-builder/settings/${id}`;

  const brand = formRecord?.form ? formRecord.form.brand : null;

  return (
    <>
      <div className="h-12"></div>
      <div
        className={`mb-8 border-3 border-dashed border-blue-focus p-4 ${
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
          <h1 className="mt-4">
            {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] ||
              t("pagePreview", { ns: "form-builder" })}
          </h1>
        </div>

        {sent ? (
          <>
            <RichText {...getLocalizationAttribute()}>
              {formRecord.form.confirmation
                ? formRecord.form.confirmation[
                    localizeField(LocalizedElementProperties.DESCRIPTION, language)
                  ]
                : ""}
            </RichText>
          </>
        ) : (
          <div className="gc-formview">
            <Form
              formRecord={formRecord}
              isPreview={true}
              language={language}
              router={router}
              t={t}
              onSuccess={setSent}
              renderSubmit={() => (
                <div id="PreviewSubmitButton">
                  <span {...getLocalizationAttribute()}>
                    <Button
                      type="submit"
                      id="SubmitButton"
                      className="mb-4"
                      onClick={(e) => {
                        if (status !== "authenticated") {
                          return preventSubmit(e);
                        }
                      }}
                    >
                      {t("submitButton", { ns: "common", lng: language })}
                    </Button>
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
              )}
            >
              {currentForm}
            </Form>
          </div>
        )}
      </div>

      {status !== "authenticated" && (
        <>
          <span className="mb-1 inline-block bg-slate-200 p-2">
            {t("confirmationPage", { ns: "form-builder" })}
          </span>
          <div className="mb-8 border-3 border-dashed border-blue-focus p-4">
            <RichText {...getLocalizationAttribute()}>
              {formRecord.form.confirmation
                ? formRecord.form.confirmation[
                    localizeField(LocalizedElementProperties.DESCRIPTION, language)
                  ]
                : ""}
            </RichText>
          </div>
        </>
      )}
    </>
  );
};
