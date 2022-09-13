import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { Form } from "./Form";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useFlag } from "@lib/hooks/useFlag";
import { getRenderedForm } from "@lib/formBuilder";

export const Preview = () => {
  const { getSchema } = useTemplateStore();
  const stringified = getSchema();

  const formRecord = {
    formID: "0",
    formConfig: JSON.parse(stringified),
  };
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const notifyPreviewFlag = useFlag("notifyPreview");
  const language = i18n.language as string;

  const currentForm = getRenderedForm(formRecord, language, t);

  return (
    <>
      <h2 className="gc-h2">Preview</h2>
      <Form
        formRecord={formRecord}
        language={language}
        router={router}
        t={t}
        notifyPreviewFlag={notifyPreviewFlag}
        isPreview={true}
      >
        {currentForm}
      </Form>
    </>
  );
};
