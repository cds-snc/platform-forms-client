import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { Form } from "../preview/Form";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";

export const Preview = () => {
  const { getSchema } = useTemplateStore();
  const stringified = getSchema();

  const formRecord = {
    formID: "test0form00000id000asdf11",
    formConfig: JSON.parse(stringified),
  };
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const language = i18n.language as string;

  const currentForm = getRenderedForm(formRecord, language, t);

  return (
    <>
      <Form formRecord={formRecord} language={language} router={router} t={t} isPreview={true}>
        {currentForm}
      </Form>
    </>
  );
};
