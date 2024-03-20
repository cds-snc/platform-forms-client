"use client";
import { Form } from "@clientComponents/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { PublicFormRecord } from "@lib/types";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

export const BrandingRequestForm = ({ formRecord }: { formRecord: PublicFormRecord | null }) => {
  const { t, i18n } = useTranslation("form-builder");
  const language = i18n.language;

  let currentForm = null;

  if (formRecord) {
    currentForm = getRenderedForm(formRecord, language);
  }

  const formTitle = language === "en" ? formRecord?.form.titleEn : formRecord?.form.titleFr;
  const router = useRouter();
  const { submitForm } = useGCFormsContext();

  // @todo - pass confirmation page handler to form via onSuccess prop
  return (
    <>
      {formRecord && (
        <>
          <h2 className="border-b-2 border-red pb-2 mb-10">{formTitle}</h2>
          <Form
            formRecord={formRecord}
            language={language}
            t={t}
            onSuccess={(formID) => router.push(`/${language}/id/${formID}/confirmation`)}
            submitForm={submitForm}
          >
            {currentForm}
          </Form>
        </>
      )}
    </>
  );
};
