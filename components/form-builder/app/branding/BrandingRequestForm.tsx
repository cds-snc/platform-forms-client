import { Form } from "@components/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

export const BrandingRequestForm = ({ formRecord }: { formRecord: FormRecord | null }) => {
  const { t } = useTranslation("form-builder");
  const language = "en";
  const router = useRouter();

  let currentForm = null;

  if (formRecord) {
    currentForm = getRenderedForm(formRecord, language, t);
  }

  const formTitle = language === "en" ? formRecord?.form.titleEn : formRecord?.form.titleFr;

  // @todo - pass confirmation page handler to form via onSuccess prop
  return (
    <>
      {formRecord && (
        <>
          <h2 className="border-b-2 border-red pb-2 mb-10">{formTitle}</h2>
          <Form formRecord={formRecord} language={language} router={router} t={t}>
            {currentForm}
          </Form>
        </>
      )}
    </>
  );
};
