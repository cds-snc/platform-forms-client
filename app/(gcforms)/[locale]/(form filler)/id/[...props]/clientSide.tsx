"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import { useMemo, type JSX } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { SaveProgressButton } from "@clientComponents/forms/SaveProgressButton/SaveProgressButton";
import { restoreProgress as restoreSession } from "@lib/utils/saveProgress";

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

  const values = useMemo(
    () => restoreSession({ id: formRecord.id, language: language as Language }),
    [formRecord.id, language]
  );

  const initialValues = values ? values : undefined;

  const { saveProgress } = useGCFormsContext();

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
