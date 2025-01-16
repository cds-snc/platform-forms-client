"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";

import { useEffect, useState, type JSX } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormValues } from "@lib/formContext";
import { SaveProgressButton } from "@clientComponents/forms/SaveProgressButton/SaveProgressButton";

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

  const { restoreProgress } = useGCFormsContext();
  const [initialValues, setInitialValues] = useState<FormValues | undefined>();

  const { saveProgress } = useGCFormsContext();

  useEffect(() => {
    const restoredValues = restoreProgress(language as Language);
    if (restoredValues) {
      setInitialValues(restoredValues);
    }
  }, [restoreProgress, language]);

  return (
    <Form
      initialValues={initialValues || undefined}
      formRecord={formRecord}
      language={language}
      onSuccess={(formID) => {
        router.push(`/${language}/id/${formID}/confirmation`);
      }}
      t={t}
      saveProgress={saveProgress}
      renderSubmit={({ validateForm, fallBack }) => {
        return (
          <>
            <NextButton
              formRecord={formRecord}
              language={language as Language}
              validateForm={validateForm}
              fallBack={fallBack}
            />
            <SaveProgressButton />
          </>
        );
      }}
      allowGrouping={allowGrouping}
    >
      {currentForm}
    </Form>
  );
};
