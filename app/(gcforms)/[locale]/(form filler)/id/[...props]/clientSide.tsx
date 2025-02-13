"use client";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import { useEffect, useMemo, useRef, type JSX } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { restoreSessionProgress, removeProgressStorage } from "@lib/utils/saveSessionProgress";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";

import { toast } from "@formBuilder/components/shared/Toast";
import { ToastContainer } from "@formBuilder/components/shared/Toast";

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
  } = useTranslation(["common", "confirmation", "form-closed"]);
  const router = useRouter();
  const { saveSessionProgress } = useGCFormsContext();

  const { getFlag } = useFeatureFlags();
  const saveAndResumeEnabled = getFlag(FeatureFlags.saveAndResume);
  const saveAndResume = formRecord?.saveAndResume && saveAndResumeEnabled;

  const formRestoredMessage = t("saveAndResume.formRestored");
  const hasShownResumeMessage = useRef(false);

  const values = useMemo(
    () =>
      restoreSessionProgress({
        id: formRecord.id,
        form: formRecord.form,
        language: language as Language,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  useEffect(() => {
    // Clear session storage after values are restored
    if (values) {
      removeProgressStorage();

      if (!hasShownResumeMessage.current && saveAndResumeEnabled) {
        hasShownResumeMessage.current = true;
        toast.success(formRestoredMessage, "public-facing-form");
      }
    }
  }, [values, formRestoredMessage, saveAndResumeEnabled]);

  const initialValues = values ? values : undefined;

  return (
    <>
      <Form
        initialValues={initialValues || undefined}
        formRecord={formRecord}
        language={language}
        onSuccess={(formID, submissionId) => {
          router.push(`/${language}/id/${formID}/confirmation/${submissionId || ""}`);
        }}
        t={t}
        saveSessionProgress={saveSessionProgress}
        saveAndResumeEnabled={saveAndResume}
        renderSubmit={({ validateForm, fallBack }) => {
          return (
            <NextButton
              formRecord={formRecord}
              language={language as Language}
              validateForm={validateForm}
              fallBack={fallBack}
              saveAndResumeEnabled={saveAndResume}
            />
          );
        }}
        allowGrouping={allowGrouping}
      >
        {currentForm}
      </Form>
      {saveAndResume && (
        <ToastContainer limit={1} autoClose={5000} containerId="public-facing-form" />
      )}
    </>
  );
};
