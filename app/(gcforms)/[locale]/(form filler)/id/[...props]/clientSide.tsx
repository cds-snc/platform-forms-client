"use client";
import { useRouter } from "next/navigation";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import React, { useMemo, useState } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

import { getRenderedForm } from "@lib/formBuilder";
import { mergeFormValuesWithInitialValues } from "@lib/formBuilder";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { TextPage } from "@clientComponents/forms";
import { showReviewPage } from "@root/lib/utils/form-builder/showReviewPage";
import { useUpdateHeadTitle } from "@root/lib/hooks/useUpdateHeadTitle";
import { getLocalizedProperty } from "@root/lib/utils";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { useResponsesCache } from "@root/lib/hooks/useResponseCache";

export const FormWrapper = ({
  formRecord,
  header,
  allowGrouping,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  header: React.ReactNode;
  allowGrouping?: boolean | undefined;
}) => {
  // TODO cast language as "en" | "fr" in TS below
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "confirmation", "form-closed", "review"]);
  const {
    setSubmissionId,
    submissionId,
    submissionDate,
    setSubmissionDate,
    currentGroup,
    getGroupTitle,
  } = useGCFormsContext();
  const [captchaFail, setCaptchaFail] = useState(false);
  const { cachedSession } = useResponsesCache();
  const captchaToken = React.useRef("");
  // TODO : If the formRecord contains file inputs Save and Resume is not available
  const resetCaptchaRef = React.useRef<{ resetToken: () => void }>({ resetToken: () => {} });

  const saveAndResume = formRecord?.saveAndResume;

  // Generate form elements on the client to ensure Formik context is available
  const currentForm = useMemo(() => {
    return getRenderedForm(formRecord, language as Language);
  }, [formRecord, language]);

  const router = useRouter();

  // For multi-page forms update the sub page head title or review page title
  // Single-page forms will be skipped since since the title set in page.tsx is sufficient
  // Updating the confirmation page title is handled in the TextPage component
  const getPageTitle = () => {
    const formTitle = String(formRecord.form[getLocalizedProperty("title", language)]);

    if (currentGroup === LOCKED_GROUPS.START) {
      return formTitle;
    }

    const isReviewPage = showReviewPage(formRecord.form) && currentGroup === LOCKED_GROUPS.REVIEW;
    if (isReviewPage) {
      return `${formTitle} - ${t("reviewForm", { lng: language, ns: "review" })}`;
    }

    return `${formTitle} - ${getGroupTitle(currentGroup, language as Language)}`;
  };
  const isMultiPageForm = showReviewPage(formRecord.form);
  useUpdateHeadTitle(getPageTitle(), isMultiPageForm);

  // Show confirmation page if submissionId is present
  if (submissionId && submissionDate) {
    return (
      <div className="gc-form-wrapper">
        <style dangerouslySetInnerHTML={{ __html: `.gc-date-modified { display: none; }` }} />
        <TextPage formId={formRecord.id} formRecord={formRecord} />
        {saveAndResume && (
          <ToastContainer limit={1} autoClose={5000} containerId="public-facing-form" />
        )}
      </div>
    );
  }

  return (
    <div id="form-filler">
      {header}

      <Form
        initialValues={
          cachedSession
            ? mergeFormValuesWithInitialValues(formRecord, language, cachedSession?.values)
            : undefined
        }
        formRecord={formRecord}
        language={language}
        onSuccess={(formID, submissionId) => {
          // Set submissionId in context
          // which will trigger confirmation page content to render
          submissionId && setSubmissionId(submissionId);
          const submissionDate = new Date().toISOString();
          setSubmissionDate(submissionDate);

          if (!saveAndResume || process.env.APP_ENV === "test") {
            // Redirect to confirmation page if save and resume is not enabled
            router.push(`/${language}/id/${formID}/confirmation`);
          }
        }}
        t={t}
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
        // Used in Formik handleSubmit where there is no access to useGCFormsContext
        currentGroup={currentGroup}
        setCaptchaFail={setCaptchaFail}
        captchaFail={captchaFail}
        captchaToken={captchaToken}
        resetCaptchaRef={resetCaptchaRef}
      >
        {currentForm}
      </Form>

      {saveAndResume && (
        <>
          <ToastContainer
            limit={1}
            autoClose={false}
            containerId="public-facing-form"
            ariaLabel="Form notifications: Alt+T"
          />
          <ToastContainer
            limit={1}
            autoClose={false}
            containerId="public-facing-form-wide"
            width="750px"
            ariaLabel="Restore warning notifications: Alt+T"
          />
        </>
      )}
    </div>
  );
};
