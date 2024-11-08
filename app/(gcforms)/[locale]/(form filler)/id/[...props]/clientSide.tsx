"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import { submitForm as submitFormAction } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";

import type { JSX } from "react";

export const FormWrapper = ({
  formRecord,
  currentForm,
  allowGrouping,
  submitForm,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  currentForm: JSX.Element[];
  allowGrouping?: boolean | undefined;
  submitForm: typeof submitFormAction;
}) => {
  // TODO cast language as "en" | "fr" in TS below
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "welcome", "confirmation", "form-closed"]);
  const router = useRouter();

  return (
    <Form
      formRecord={formRecord}
      language={language}
      onSuccess={(formID) => {
        router.push(`/${language}/id/${formID}/confirmation`);
      }}
      t={t}
      renderSubmit={({ validateForm, fallBack }) => {
        return (
          <NextButton
            formRecord={formRecord}
            language={language as Language}
            validateForm={validateForm}
            fallBack={fallBack}
          />
        );
      }}
      allowGrouping={allowGrouping}
      submitForm={submitForm}
    >
      {currentForm}
    </Form>
  );
};
