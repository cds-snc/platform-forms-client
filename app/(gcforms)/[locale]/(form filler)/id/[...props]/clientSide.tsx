"use client";
import { Form, NextButton } from "@clientComponents/forms";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";

export const FormWrapper = ({
  formRecord,
  currentForm,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption" | "bearerToken">;
  currentForm: JSX.Element[];
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
        return <NextButton validateForm={validateForm} fallBack={fallBack} />;
      }}
    >
      {currentForm}
    </Form>
  );
};
