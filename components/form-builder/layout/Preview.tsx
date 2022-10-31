import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import useNavigationStore from "../store/useNavigationStore";
import { Form } from "../preview/Form";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";
import { usePublish } from "../hooks/usePublish";
import { useCallback } from "react";

export const Preview = ({ isPreview }: { isPreview: boolean }) => {
  const { getSchema } = useTemplateStore();
  const stringified = getSchema();
  const { formId, setFormId } = useNavigationStore();
  const { uploadJson } = usePublish(false);

  const formRecord = {
    id: formId || "test0form00000id000asdf11",
    ...JSON.parse(stringified),
  };

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const language = i18n.language as string;

  const currentForm = getRenderedForm(formRecord, language, t);

  const handlePublish = useCallback(async () => {
    const result = await uploadJson(getSchema(), formId);
    if (result && result?.error) {
      return;
    }

    setFormId(result?.id);
  }, [setFormId]);

  let instructions = null;

  if (!isPreview) {
    instructions = (
      <div>
        <button onClick={handlePublish}>Save Draft</button>
      </div>
    );
  }

  return (
    <>
      <p>{formId}</p>
      {instructions}
      <Form formRecord={formRecord} language={language} router={router} t={t} isPreview={isPreview}>
        {currentForm}
      </Form>
    </>
  );
};
