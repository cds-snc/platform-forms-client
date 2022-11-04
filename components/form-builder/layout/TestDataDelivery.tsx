import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useCallback } from "react";
import { usePublish } from "../hooks/usePublish";
import { useTranslation } from "next-i18next";
import { Button } from "../shared/Button";
import { Form } from "../preview/Form";
import { LocalizedFormProperties } from "../types";
import { useRouter } from "next/router";
import { getRenderedForm } from "@lib/formBuilder";

export const TestDataDelivery = () => {
  const { getSchema, id, setId, email } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission.email,
  }));
  const stringified = getSchema();

  const formRecord = {
    id: id || "test0form00000id000asdf11",
    ...JSON.parse(stringified),
  };

  const { localizeField } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
  }));

  const router = useRouter();
  const { t: t1 } = useTranslation("");
  const { t, i18n } = useTranslation("form-builder");
  const language = i18n.language as string;
  const currentForm = getRenderedForm(formRecord, language, t);

  const { uploadJson } = usePublish();
  const handlePublish = useCallback(async () => {
    const result = await uploadJson(getSchema(), id);
    if (result && result?.error) {
      return;
    }
    setId(result?.id);
  }, [setId]);

  return (
    <div>
      <div className="mb-8 bg-blue-200 p-5">{t("submittedResponsesText", { email })}</div>

      <p>{t("ToTestInstructions")}</p>
      <ol className="ml-5 mb-8 mt-6">
        {!id && (
          <li className="mb-4">
            {t("saveYourForm")}
            <Button theme="secondary" className="ml-4" onClick={handlePublish}>
              {t("save")}
            </Button>
          </li>
        )}
        <li>{t("fillFormClickSubmit")}</li>
      </ol>

      <div className="border-3 border-dashed border-blue-focus p-4 mb-8">
        <h1>{formRecord.form[localizeField(LocalizedFormProperties.TITLE)]}</h1>

        <Form
          formRecord={formRecord}
          language={language}
          router={router}
          t={t1}
          submitAlert={t("submitToTestDataDelivery")}
        >
          {currentForm}
        </Form>
      </div>
    </div>
  );
};
