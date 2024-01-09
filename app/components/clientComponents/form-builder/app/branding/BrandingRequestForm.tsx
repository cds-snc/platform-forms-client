"use client";
import { Form } from "@clientComponents/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { PublicFormRecord } from "@lib/types";
import React from "react";
import { useTranslation } from "@i18n/client";

export const BrandingRequestForm = ({ formRecord }: { formRecord: PublicFormRecord | null }) => {
  const { t, i18n } = useTranslation("form-builder");
  const language = i18n.language;

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
          <Form formRecord={formRecord} language={language} t={t}>
            {currentForm}
          </Form>
        </>
      )}
    </>
  );
};
