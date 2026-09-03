"use client";
import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { FormikProvider, useFormik, type FormikHelpers } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage } from "@lib/validation/validation";
import { validateOnSubmit } from "@gcforms/core";
import { useHCaptcha, type HCaptchaExecutionResult } from "@gcforms/hcaptcha/client";

import { type FormProps, type FormRenderProps } from "./types";
import { type Responses as FormikResponses } from "@lib/types";

import { EventKeys } from "@lib/hooks/useCustomEvent";

import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";

import {
  submitForm,
  isFormClosed,
} from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import { useSyncVisibleElementIds } from "@lib/hooks/useSyncVisibleElementIds";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { filterValuesByVisibleElements } from "@lib/formContext";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { FormStatus, type FormValues } from "@gcforms/types";
import { CaptchaFail } from "@clientComponents/globals/FormCaptcha/CaptchaFail";
import { ga } from "@lib/client/clientHelpers";
import { SubmitProgress } from "@clientComponents/forms/SubmitProgress/SubmitProgress";
import { handleUploadError } from "@lib/fileInput/handleUploadError";
import { hasFiles } from "@lib/fileExtractor";
import { generateFileChecksums } from "@lib/utils/fileChecksum";
import { copyObjectExcludingFileContent } from "@lib/fileExtractor";
import { uploadFile } from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/fileUploader";

import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { shouldCheckCaptcha } from "@root/lib/utils/shouldCheckCaptcha";
import { isSuspiciousHCaptchaError } from "@clientComponents/globals/FormCaptcha/isSuspiciousHCaptchaError";
import { FormBody } from "./FormBody";
import { FormStatusAlerts } from "./FormStatusAlerts";
import { getFormStatusError } from "./getFormStatusError";

type CaptchaControls = {
  captcha: React.ReactNode;
  captchaEnabled: boolean;
  executeCaptcha: () => Promise<HCaptchaExecutionResult>;
  resetCaptcha: () => void;
};

const useFormErrorFocus = (
  props: FormRenderProps,
  formStatusError: string | true | null,
  errorList: ReturnType<typeof getErrorList> | null,
  errorId: string,
  serverErrorId: string
) => {
  const lastSubmitCountRef = useRef(props.submitCount);
  const focusOnValidationErrorRef = useRef(false);

  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }

    if (props.isValid) {
      lastSubmitCountRef.current = props.submitCount;
      return;
    }

    const shouldFocusValidationError =
      props.submitCount > lastSubmitCountRef.current || focusOnValidationErrorRef.current;

    if (shouldFocusValidationError) {
      lastSubmitCountRef.current = props.submitCount;
      focusOnValidationErrorRef.current = false;
      queueMicrotask(() => setFocusOnErrorMessage(props, errorId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStatusError, errorList, props.isValid, props.submitCount]);

  useEffect(() => {
    const handleContinueValidationError = () => {
      focusOnValidationErrorRef.current = true;
    };

    document.addEventListener(EventKeys.continueValidationError, handleContinueValidationError);

    return () => {
      document.removeEventListener(
        EventKeys.continueValidationError,
        handleContinueValidationError
      );
    };
  }, []);
};

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;
const useIsHydrated = () =>
  useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);

const SubmittingForm = ({ title, hasFileValues }: { title: string; hasFileValues: boolean }) => (
  <>
    <title>{title}</title>
    <SubmitProgress spinner={!hasFileValues} />
  </>
);

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
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

const submitFormValues = async (
  values: FormikResponses,
  formikBag: FormikHelpers<FormikResponses>,
  props: FormProps,
  { captchaEnabled, executeCaptcha, resetCaptcha }: Omit<CaptchaControls, "captcha">
) => {
  // If the form is closed, do not allow submission
  if (await isFormClosed(props.formRecord.id)) {
    formikBag.setStatus(FormStatus.FORM_CLOSED_ERROR);
    return;
  }

  // For groups enabled forms only allow submitting on the Review page
  const isShowReviewPage = showReviewPage(props.formRecord.form);
  if (isShowReviewPage && props.currentGroup !== LOCKED_GROUPS.REVIEW) {
    return;
  }

  try {
    let captchaToken: string | undefined;
    if (captchaEnabled) {
      const captchaResult = await executeCaptcha();

      if (!captchaResult.verified) {
        if (captchaResult.reason === "load-error") {
          resetCaptcha();
        }

        if (captchaResult.reason !== "cancelled") {
          formikBag.setStatus(FormStatus.ERROR);
        }

        return;
      }

      captchaToken = captchaResult.token;
    }

    // Needed so the Loader is displayed after hCaptcha has completed and submission starts
    formikBag.setStatus("submitting");

    const formValues = filterValuesByVisibleElements(props.formRecord, values as FormValues);

    // Extract file content from formValues so they are not part of the submission call to the submit action
    const { formValuesWithoutFileContent, fileObjsRef } =
      copyObjectExcludingFileContent(formValues);

    const fileChecksums = await generateFileChecksums(fileObjsRef);
    let submitProgress = 0;
    let progressInterval: NodeJS.Timeout | undefined = undefined;

    if (hasFiles(values)) {
      progressInterval = setInterval(() => {
        if (submitProgress <= 0.1) {
          submitProgress += 0.02;
          document.dispatchEvent(
            new CustomEvent(EventKeys.submitProgress, {
              detail: {
                progress: submitProgress,
                message: props.t("submitProgress.text"),
              },
            })
          );
        } else {
          clearInterval(progressInterval);
        }
      }, 500);
    }

    const result = await submitForm(
      formValuesWithoutFileContent,
      props.language,
      props.formRecord.id,
      props.isPreview ?? false,
      captchaToken,
      fileChecksums
    );

    clearInterval(progressInterval);

    // Start here to upload files and handle errors below into something easier to read

    if (result.error) {
      if (result.error.name === FormStatus.CAPTCHA_VERIFICATION_ERROR) {
        formikBag.setStatus(FormStatus.CAPTCHA_VERIFICATION_ERROR);
        props.setCaptchaFail && props.setCaptchaFail(true);
      } else {
        formikBag.setStatus(FormStatus.ERROR);
      }

      // Avoid a potential error where a token could be reused by re-submitting after an error
      resetCaptcha();

      return;
    }

    if (
      (!result.fileURLMap ? 0 : Object.keys(result.fileURLMap).length) !==
      Object.keys(fileObjsRef).length
    ) {
      logMessage.error("File Upload count mismatch");
      formikBag.setStatus(FormStatus.ERROR);
    }

    // Handle if there are files to upload
    if (result.fileURLMap && Object.keys(result?.fileURLMap).length > 0) {
      const totalFiles = Object.keys(result.fileURLMap).length;
      const fileProgress: { [key: string]: number } = {};

      const uploadPromises = Object.entries(result.fileURLMap).map(async ([fileId, signedPost]) => {
        fileProgress[fileId] = 0;
        await uploadFile(fileObjsRef[fileId], signedPost, (ev) => {
          if (!ev.progress || !document) return;

          fileProgress[fileId] = ev.progress;
          const totalProgress =
            Object.values(fileProgress).reduce((acc, progress) => acc + progress, 0) / totalFiles;

          if (totalProgress <= submitProgress) {
            // Don't dispatch progress events if the total progress is less than what we've already dispatched
            return;
          }

          document.dispatchEvent(
            new CustomEvent(EventKeys.submitProgress, {
              detail: {
                progress: totalProgress,
                message: props.t("submitProgress.uploadingFiles", {
                  totalFiles,
                }),
              },
            })
          );
        });
      });

      await Promise.all(uploadPromises);
    }

    props.onSuccess(result.id, result?.submissionId);
  } catch (err) {
    logMessage.error(err as Error);

    const fileUploadError = handleUploadError(err as Error, props.t);

    if (fileUploadError) {
      formikBag.setStatus({
        heading: fileUploadError.heading,
        message: fileUploadError.message,
      });
    } else {
      formikBag.setStatus("Error");
    }

    // Avoid a potential error where a token could be reused by re-submitting after an error
    resetCaptcha();
  } finally {
    if (!props.isPreview) {
      ga("form_submission_trigger", {
        formID: props.formRecord.id,
        formTitle: props.formRecord.form.titleEn,
      });
    }

    formikBag.setSubmitting(false);
  }
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
