"use client";
import React from "react";
import { FormikProvider, useFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList } from "@lib/validation/validation";
import { validateOnSubmit } from "@gcforms/core";
import { useHCaptcha } from "@gcforms/hcaptcha/client";

import { type FormProps, type FormRenderProps } from "./types";
import { type Responses as FormikResponses } from "@lib/types";

import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";

import { useSyncVisibleElementIds } from "@lib/hooks/useSyncVisibleElementIds";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { CaptchaFail } from "@clientComponents/globals/FormCaptcha/CaptchaFail";
import { SubmitProgress } from "@clientComponents/forms/SubmitProgress/SubmitProgress";
import { hasFiles } from "@lib/fileExtractor";

import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { shouldCheckCaptcha } from "@root/lib/utils/shouldCheckCaptcha";
import { isSuspiciousHCaptchaError } from "@clientComponents/globals/FormCaptcha/isSuspiciousHCaptchaError";
import { FormBody } from "./FormBody";
import { FormStatusAlerts } from "./FormStatusAlerts";
import { getFormStatusError } from "./getFormStatusError";
import { submitFormValues } from "./submitFormValues";
import { useFormErrorFocus } from "./useFormErrorFocus";
import { useIsHydrated } from "./useIsHydrated";

const SubmittingForm = ({ title, hasFileValues }: { title: string; hasFileValues: boolean }) => (
  <>
    <title>{title}</title>
    <SubmitProgress spinner={!hasFileValues} />
  </>
);

/**
 * The main content of the form, handling rendering of status alerts, form body, and submission states.
 * @param props - The properties passed down from the parent form component.
 */
const FormContent: React.FC<FormRenderProps> = (props) => {
  const {
    status,
    language,
    formRecord: { id: formID, form },
    dirty,
  }: FormRenderProps = props;

  const { t } = useTranslation();
  const isHydrated = useIsHydrated();

  const { currentGroup, getGroupTitle } = useGCFormsContext();
  const isShowReviewPage = showReviewPage(form);
  const showIntro = currentGroup === LOCKED_GROUPS.START;

  // Used to set any values we'd like available during Formik submission.
  useSyncVisibleElementIds();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = getFormStatusError(
    props,
    language,
    t("server-error"),
    t("form-closed-error")
  );

  useFormErrorFocus(props, formStatusError, errorList, errorId, serverErrorId);

  // Don't prerender the form on the server because inputs will change and cause
  // hydration errors based on state stored client side
  if (!isHydrated) {
    return <div className="h-[150dvh]" />;
  }

  // Show the Captcha fail screen when hCAPTCHA detects a suspicous user
  // Note: check done here vs higher in the tree so the Form session will still exist on the screen
  if (props.captchaFail) {
    return <CaptchaFail />;
  }

  if (status === "submitting") {
    return <SubmittingForm title={t("loading")} hasFileValues={hasFiles(props.values)} />;
  }

  return (
    <>
      <FormStatusAlerts
        props={props}
        formStatusError={formStatusError}
        errorList={errorList}
        serverErrorId={serverErrorId}
        errorId={errorId}
        language={language}
        formID={formID}
      />

      <FormBody
        props={props}
        formID={formID}
        form={form}
        dirty={dirty}
        currentGroup={currentGroup}
        getGroupTitle={getGroupTitle}
        isShowReviewPage={isShowReviewPage}
        showIntro={showIntro}
      />
    </>
  );
};

export const Form: React.FC<FormProps> = (props) => {
  const { setCaptchaFail } = props;
  const captchaEnabled = shouldCheckCaptcha(props.formRecord.isPublished, props.isPreview ?? false);
  const handleCaptchaError = (code: string) => {
    if (isSuspiciousHCaptchaError(code)) {
      logMessage.warn(
        `hCaptcha: suspicious error "${code}" detected - possible tampering. Submission blocked. Resetting widget state.`
      );
      setCaptchaFail?.(true);
    } else if (code === "invalid-sitekey" || code === "missing-sitekey") {
      logMessage.error(`hCaptcha: critical configuration error "${code}". Submission blocked.`);
    } else {
      logMessage.warn(`hCaptcha: recoverable error "${code}" - user can retry submission`);
    }
  };

  const { captcha, execute, reset } = useHCaptcha({
    language: props.language,
    onCaptchaVerified: () =>
      logMessage.info(`hCaptcha: verified token received by form at ${new Date().toISOString()}`),
    onError: handleCaptchaError,
    siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
  });

  const formik = useFormik<FormikResponses>({
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true, // needed when switching languages
    initialValues: props.initialValues ?? getFormInitialValues(props.formRecord, props.language),
    validate: (values) => validateOnSubmit(values, props),
    onSubmit: (values, formikBag) =>
      submitFormValues(values, formikBag, props, {
        captchaEnabled,
        executeCaptcha: execute,
        resetCaptcha: reset,
      }),
  });

  return (
    <FormikProvider value={formik}>
      <FormContent {...props} {...formik} captcha={captcha} captchaEnabled={captchaEnabled} />
    </FormikProvider>
  );
};
