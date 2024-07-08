"use client";
import { NextButton } from "@clientComponents/forms";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";

export const FormWrapper = ({
  formRecord,
  currentForm,
  allowGrouping,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  currentForm: JSX.Element[];
  allowGrouping?: boolean | undefined;
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
    >
      {currentForm}
    </Form>
  );
};
