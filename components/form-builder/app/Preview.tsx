import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";
import { RichText } from "@components/forms/RichText/RichText";
import { LocalizedElementProperties, LocalizedFormProperties } from "../types";
import { Form } from "@components/forms";

export const Preview = () => {
  const { getSchema, id } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
  }));
  const stringified = getSchema();

  const formRecord = {
    id: id || "test0form00000id000asdf11",
    ...JSON.parse(stringified),
  };

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const router = useRouter();
  const { t: t1 } = useTranslation();
  const { t } = useTranslation("form-builder");
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language, t);

  return (
    <>
      <span className="bg-purple-200 p-2 inline-block mb-1">{t("page1")}</span>
      <div className="border-3 border-dashed border-blue-focus p-4 mb-8 pointer-events-none">
        <h1 className="md:text-h1">
          {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] || t("preview")}
        </h1>

        <Form
          formRecord={formRecord}
          language={language}
          router={router}
          t={t1}
          isPreview={true}
          renderSubmit={(submitButton) => (
            <>
              {submitButton}
              <div className="inline-block py-1 px-4 bg-purple-200">
                {t("formSubmissionDisabledInPreview")}
              </div>
            </>
          )}
        >
          {currentForm}
        </Form>
      </div>

      <span className="bg-purple-200 p-2 inline-block mb-1">{t("confirmationPage")}</span>
      <div className="border-3 border-dashed border-blue-focus p-4 mb-8">
        <RichText>
          {formRecord.form.endPage
            ? formRecord.form.endPage[
                localizeField(LocalizedElementProperties.DESCRIPTION, language)
              ]
            : ""}
        </RichText>
      </div>
    </>
  );
};
