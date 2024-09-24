"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const FormWrapper = ({
  formRecord,
  currentForm,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  currentForm: JSX.Element[];
}) => {
  // TODO cast language as "en" | "fr" in TS below
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "welcome", "confirmation", "form-closed"]);
  const router = useRouter();

  // The Form handleSubmit() needs to be passed allowGrouping because it is not a top level
  // component that can use hooks. Why the passing props here to the FormikBag.
  //
  // TODO: allowGrouping will soon be hardcoded to true so getFlag can be replaced here.
  const { getFlag } = useFeatureFlags();
  const allowGrouping = getFlag("conditionalLogic");

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
