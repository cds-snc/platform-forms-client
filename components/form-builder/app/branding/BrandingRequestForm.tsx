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
  // @todo - pass confirmation page handler to form via onSuccess prop
  return (
    <>
      {formRecord && (
        <Form formRecord={formRecord} language={language} router={router} t={t}>
          {currentForm}
        </Form>
      )}
    </>
  );
};
