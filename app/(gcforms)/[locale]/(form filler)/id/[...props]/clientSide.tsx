"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import { useEffect, useMemo, type JSX } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { restoreProgress, removeProgressStorage } from "@lib/utils/saveProgress";

export const FormWrapper = ({
  formRecord,
  currentForm,
  allowGrouping,
  hCaptchaSiteKey,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  currentForm: JSX.Element[];
  allowGrouping?: boolean | undefined;
  hCaptchaSiteKey: string;
}) => {
  // TODO cast language as "en" | "fr" in TS below
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "confirmation", "form-closed"]);
  const router = useRouter();

  const { saveProgress } = useGCFormsContext();

  const values = useMemo(
    () =>
      restoreProgress({ id: formRecord.id, form: formRecord.form, language: language as Language }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  useEffect(() => {
    // Clear session storage after values are restored
    if (values) {
      removeProgressStorage();
    }
  }, [values]);

  const initialValues = values ? values : undefined;

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
          </>
        );
      }}
      allowGrouping={allowGrouping}
      hCaptchaSiteKey={hCaptchaSiteKey}
    >
      {currentForm}
    </Form>
  );
};
