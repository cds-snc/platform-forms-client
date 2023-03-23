import React, { useEffect, useRef, useState } from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";
import { RichText } from "@components/forms/RichText/RichText";
import { LocalizedElementProperties, LocalizedFormProperties } from "../types";
import { Button, Form } from "@components/forms";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { useTemplateApi } from "../hooks";
import { BackArrowIcon } from "../icons";
import { PublicFormRecord } from "@lib/types";

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

  const { localizeField, translationLanguagePriority, getLocalizationAttribute, setId, email } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      getLocalizationAttribute: s.getLocalizationAttribute,
      setId: s.setId,
      email: s.deliveryOption?.emailAddress,
    }));

  const router = useRouter();

  const { t } = useTranslation(["common", "form-builder"]);
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language, t);
  const { saveForm } = useTemplateApi();
  const [sent, setSent] = useState<string | null>();
  const saved = useRef(false);

  const clearSent = () => {
    setSent(null);
  };

  useEffect(() => {
    if (status === "authenticated" && !saved.current && !id) {
      const save = async () => {
        const result = await saveForm();
        if (result) {
          setId(result);
        }
      };

      save();

      return () => {
        saved.current = true;
      };
    }
  }, [status, id, saveForm, setId]);

  const preventSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    return false;
  };

  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;
  const settingsLink = `/${i18n.language}/form-builder/settings/${id}`;

  return (
    <>
      <div className="h-12"></div>
      <div
        className={`border-3 border-dashed border-blue-focus p-4 mb-8 ${
          status !== "authenticated" && ""
        }`}
        {...getLocalizationAttribute()}
      >
        {status !== "authenticated" ? (
          <div className="bg-purple-200 p-2 inline-block mb-1">
            <Markdown options={{ forceBlock: true }}>
              {t("signInToTest", { ns: "form-builder" })}
            </Markdown>
          </div>
        ) : email ? (
          <div className="bg-purple-200 p-2 inline-block mb-1">
            {t("submittedResponsesText", { ns: "form-builder", email })}{" "}
            <a className="visited:text-black-default" href={settingsLink}>
              {t("submittedResponsesChange", { ns: "form-builder" })}
            </a>
            .
          </div>
        ) : (
          <div className="bg-purple-200 p-2 inline-block mb-1">
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
            <button className="mt-4 clear-both block" onClick={() => clearSent()}>
              <BackArrowIcon className="inline-block" /> {t("backToForm", { ns: "form-builder" })}
            </button>
          </>
        )}

        <h1 className="mt-4">
          {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] ||
            t("pagePreview", { ns: "form-builder" })}
        </h1>

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
          <Form
            formRecord={formRecord}
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
                    onClick={(e) => {
                      if (status !== "authenticated") {
                        return preventSubmit(e);
                      }
                    }}
                  >
                    {t("submitButton", { ns: "common" })}
                  </Button>
                </span>
                {status !== "authenticated" && (
                  <div
                    className="inline-block py-1 px-4 bg-purple-200"
                    {...getLocalizationAttribute()}
                  >
                    <Markdown options={{ forceBlock: true }}>
                      {t("signInToTest", { ns: "form-builder" })}
                    </Markdown>
                  </div>
                )}
              </div>
            )}
          >
            {currentForm}
          </Form>
        )}
      </div>

      {status !== "authenticated" && (
        <>
          <span className="bg-slate-200 p-2 inline-block mb-1">
            {t("confirmationPage", { ns: "form-builder" })}
          </span>
          <div className="border-3 border-dashed border-blue-focus p-4 mb-8">
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
