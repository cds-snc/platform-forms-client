"use client";
import { useRouter } from "next/navigation";
import { NextButton } from "@clientComponents/forms/NextButton/NextButton";
import { useTranslation } from "@i18n/client";
import { FormRecord, TypeOmit } from "@lib/types";
import { Form } from "@clientComponents/forms/Form/Form";
import { Language } from "@lib/types/form-builder-types";
import React, { useEffect, useMemo, useState, type JSX } from "react";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { restoreSessionProgress, removeProgressStorage } from "@lib/utils/saveSessionProgress";

import { toast } from "@formBuilder/components/shared/Toast";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { TextPage } from "@clientComponents/forms";
import { showReviewPage } from "@root/lib/utils/form-builder/showReviewPage";
import { LockedSections } from "../../../(form administration)/form-builder/components/shared/right-panel/treeview/types";
import { useUpdateHeadTitle } from "@root/lib/hooks/useUpdateHeadTitle";
import { getLocalizedProperty } from "@root/lib/utils";

// For Multi-Page forms get the page head title for the:
// - Initial page, set the title to {form title} *done at the page level*
// - Group pages, set the title to {form title - group title}
// - Review page, set the title to {form title - Review}
const getPageTitle = (
  formRecord: FormRecord,
  language: Language,
  currentGroup: string | null,
  groupTitle: string,
  reviewString: string
) => {
  const isShowReviewPage = showReviewPage(formRecord.form);
  const pageTitleGroup = `${
    formRecord.form[getLocalizedProperty("title", language)]
  } - ${groupTitle}`;
  const pageTitleReview = `${
    formRecord.form[getLocalizedProperty("title", language)]
  } - ${reviewString}`;
  return isShowReviewPage && currentGroup !== LockedSections.REVIEW
    ? pageTitleGroup
    : pageTitleReview;
};

export const FormWrapper = ({
  formRecord,
  header,
  currentForm,
  allowGrouping,
}: {
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  header: React.ReactNode;
  currentForm: JSX.Element[];
  allowGrouping?: boolean | undefined;
}) => {
  // TODO cast language as "en" | "fr" in TS below
  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "confirmation", "form-closed", "review"]);
  const {
    saveSessionProgress,
    setSubmissionId,
    submissionId,
    submissionDate,
    setSubmissionDate,
    currentGroup,
    getGroupTitle,
  } = useGCFormsContext();
  const [captchaFail, setCaptchaFail] = useState(false);
  const captchaToken = React.useRef("");
  const saveAndResume = formRecord?.saveAndResume;

  const formRestoredMessage = t("saveAndResume.formRestored");
  const router = useRouter();

  const savedValues = useMemo(() => {
    const result = restoreSessionProgress({
      id: formRecord.id,
      form: formRecord.form,
      language: language as Language,
    });

    if (!result) {
      return false;
    }

    return result;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, formRecord.id]);

  // Update the page head title for multi-page forms
  const pageTitle = useMemo(() => {
    return getPageTitle(
      formRecord as FormRecord,
      language as Language,
      currentGroup,
      getGroupTitle(currentGroup, language as Language),
      t("reviewForm", { lng: language, ns: "review" })
    );
  }, [formRecord, language, currentGroup, getGroupTitle, t]);
  useUpdateHeadTitle(pageTitle, showReviewPage(formRecord.form));

  useEffect(() => {
    // Clear session storage after values are restored
    if (savedValues) {
      removeProgressStorage();

      if (savedValues.language === language) {
        toast.success(formRestoredMessage, "public-facing-form");
      }
    }
  }, [savedValues, formRestoredMessage, language]);

  const initialValues = savedValues ? savedValues.values : undefined;

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
    <>
      {header}
      <Form
        initialValues={initialValues || undefined}
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
        // Used in Formik handleSubmit where there is no access to useGCFormsContext
        currentGroup={currentGroup}
        setCaptchaFail={setCaptchaFail}
        captchaFail={captchaFail}
        captchaToken={captchaToken}
      >
        {currentForm}
      </Form>

      {saveAndResume && (
        <ToastContainer limit={1} autoClose={false} containerId="public-facing-form" />
      )}
    </>
  );
};
