import React, { useState } from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";
import { RichText } from "@components/forms/RichText/RichText";
import { LocalizedElementProperties, LocalizedFormProperties } from "../types";
import { Button, Form } from "@components/forms";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { usePublish } from "../hooks";

export const Preview = () => {
  const { status } = useSession();
  const { getSchema, id } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
  }));
  const stringified = getSchema();

  const formRecord = {
    id: id || "test0form00000id000asdf11",
    ...JSON.parse(stringified),
  };

  const { localizeField, translationLanguagePriority, getLocalizationAttribute, setId } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      getLocalizationAttribute: s.getLocalizationAttribute,
      setId: s.setId,
    }));

  const router = useRouter();
  const { t: t1 } = useTranslation();
  const { t } = useTranslation("form-builder");
  const language = translationLanguagePriority;
  const currentForm = getRenderedForm(formRecord, language, t);

  const { uploadJson } = usePublish();
  const [error, setError] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    if (status !== "authenticated") {
      e.preventDefault();
      return false;
    }
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);
    if (result && result?.error) {
      setError(true);
    }

    setId(result?.id);
  };

  return (
    <>
      {status !== "authenticated" ? (
        <span className="bg-purple-200 p-2 inline-block mb-1">
          <Markdown options={{ forceBlock: true }}>{t("signInToTest")}</Markdown>
        </span>
      ) : (
        <div className="h-12"></div>
      )}
      <div
        className={`border-3 border-dashed border-blue-focus p-4 mb-8 ${
          status !== "authenticated" && ""
        }`}
        {...getLocalizationAttribute()}
      >
        <h1 className="md:text-h1">
          {formRecord.form[localizeField(LocalizedFormProperties.TITLE, language)] || t("preview")}
        </h1>

        <Form
          formRecord={formRecord}
          language={language}
          router={router}
          t={t1}
          isPreview={status === "authenticated" ? false : true}
          renderSubmit={() => (
            <>
              <span {...getLocalizationAttribute()}>
                <Button type="submit" onClick={handleSubmit}>
                  {t("submit")}
                </Button>
              </span>
              <div className="inline-block py-1 px-4 bg-purple-200" {...getLocalizationAttribute()}>
                <Markdown options={{ forceBlock: true }}>{t("signInToTest")}</Markdown>
              </div>
            </>
          )}
        >
          {currentForm}
        </Form>
      </div>

      <span className="bg-purple-200 p-2 inline-block mb-1">{t("confirmationPage")}</span>
      <div className="border-3 border-dashed border-blue-focus p-4 mb-8">
        <RichText {...getLocalizationAttribute()}>
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
