import { type FormikHelpers } from "formik";
import { type HCaptchaExecutionResult } from "@gcforms/hcaptcha/client";
import { type Responses as FormikResponses } from "@lib/types";

import {
  submitForm,
  isFormClosed,
} from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import { EventKeys } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { filterValuesByVisibleElements } from "@lib/formContext";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { FormStatus, type FormValues } from "@gcforms/types";
import { ga } from "@lib/client/clientHelpers";
import { handleUploadError } from "@lib/fileInput/handleUploadError";
import { hasFiles } from "@lib/fileExtractor";
import { generateFileChecksums } from "@lib/utils/fileChecksum";
import { copyObjectExcludingFileContent } from "@lib/fileExtractor";
import { uploadFile } from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/fileUploader";
import { LOCKED_GROUPS } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";

import { type FormProps } from "./types";

export type CaptchaSubmitControls = {
  captchaEnabled: boolean;
  executeCaptcha: () => Promise<HCaptchaExecutionResult>;
  resetCaptcha: () => void;
};

type CaptchaSubmitResult = { status: "verified"; token?: string } | { status: "blocked" };

type SubmitFormResult = Awaited<ReturnType<typeof submitForm>>;
type FileURLMap = NonNullable<SubmitFormResult["fileURLMap"]>;
type FileObjects = ReturnType<typeof copyObjectExcludingFileContent>["fileObjsRef"];
type SubmissionProgress = {
  current: number;
  stop: () => void;
};

export const submitFormValues = async (
  values: FormikResponses,
  formikBag: FormikHelpers<FormikResponses>,
  props: FormProps,
  { captchaEnabled, executeCaptcha, resetCaptcha }: CaptchaSubmitControls
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
    const captchaResult = await getCaptchaTokenForSubmission(
      { captchaEnabled, executeCaptcha, resetCaptcha },
      formikBag
    );
    if (captchaResult.status === "blocked") {
      return;
    }

    // Needed so the Loader is displayed after hCaptcha has completed and submission starts
    formikBag.setStatus("submitting");

    const formValues = filterValuesByVisibleElements(props.formRecord, values as FormValues);

    // Extract file content from formValues so they are not part of the submission call to the submit action
    const { formValuesWithoutFileContent, fileObjsRef } =
      copyObjectExcludingFileContent(formValues);

    const fileChecksums = await generateFileChecksums(fileObjsRef);
    const submissionProgress = startSubmissionProgress(values, props.t);

    const result = await submitForm(
      formValuesWithoutFileContent,
      props.language,
      props.formRecord.id,
      props.isPreview ?? false,
      captchaResult.token,
      fileChecksums
    );

    submissionProgress.stop();

    if (handleSubmitError(result, formikBag, props, resetCaptcha)) {
      return;
    }

    const fileURLMap = result.fileURLMap;
    if (getFileCount(fileURLMap) !== Object.keys(fileObjsRef).length) {
      logMessage.error("File Upload count mismatch");
      formikBag.setStatus(FormStatus.ERROR);
    }

    await uploadSubmissionFiles(fileURLMap, fileObjsRef, submissionProgress, props.t);

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

const getCaptchaTokenForSubmission = async (
  { captchaEnabled, executeCaptcha, resetCaptcha }: CaptchaSubmitControls,
  formikBag: FormikHelpers<FormikResponses>
): Promise<CaptchaSubmitResult> => {
  if (!captchaEnabled) {
    return { status: "verified" };
  }

  const captchaResult = await executeCaptcha();

  if (captchaResult.verified) {
    return { status: "verified", token: captchaResult.token };
  }

  if (captchaResult.reason === "load-error") {
    resetCaptcha();
  }

  if (captchaResult.reason !== "cancelled") {
    formikBag.setStatus(FormStatus.ERROR);
  }

  return { status: "blocked" };
};

const startSubmissionProgress = (
  values: FormikResponses,
  t: FormProps["t"]
): SubmissionProgress => {
  const progress: SubmissionProgress = {
    current: 0,
    stop: () => undefined,
  };

  if (!hasFiles(values)) {
    return progress;
  }

  const progressInterval = setInterval(() => {
    if (progress.current <= 0.1) {
      progress.current += 0.02;
      document.dispatchEvent(
        new CustomEvent(EventKeys.submitProgress, {
          detail: {
            progress: progress.current,
            message: t("submitProgress.text"),
          },
        })
      );
      return;
    }

    progress.stop();
  }, 500);

  progress.stop = () => clearInterval(progressInterval);
  return progress;
};

const handleSubmitError = (
  result: SubmitFormResult,
  formikBag: FormikHelpers<FormikResponses>,
  props: FormProps,
  resetCaptcha: () => void
) => {
  if (!result.error) {
    return false;
  }

  if (result.error.name === FormStatus.CAPTCHA_VERIFICATION_ERROR) {
    formikBag.setStatus(FormStatus.CAPTCHA_VERIFICATION_ERROR);
    props.setCaptchaFail && props.setCaptchaFail(true);
  } else {
    formikBag.setStatus(FormStatus.ERROR);
  }

  // Avoid a potential error where a token could be reused by re-submitting after an error
  resetCaptcha();

  return true;
};

const getFileCount = (fileURLMap: FileURLMap | undefined) => {
  return fileURLMap ? Object.keys(fileURLMap).length : 0;
};

const uploadSubmissionFiles = async (
  fileURLMap: FileURLMap | undefined,
  fileObjsRef: FileObjects,
  submissionProgress: SubmissionProgress,
  t: FormProps["t"]
) => {
  if (!fileURLMap || Object.keys(fileURLMap).length === 0) {
    return;
  }

  const totalFiles = Object.keys(fileURLMap).length;
  const fileProgress: { [key: string]: number } = {};

  const uploadPromises = Object.entries(fileURLMap).map(async ([fileId, signedPost]) => {
    fileProgress[fileId] = 0;
    await uploadFile(fileObjsRef[fileId], signedPost, (ev) => {
      if (!ev.progress || !document) return;

      fileProgress[fileId] = ev.progress;
      const totalProgress =
        Object.values(fileProgress).reduce((acc, progress) => acc + progress, 0) / totalFiles;

      if (totalProgress <= submissionProgress.current) {
        return;
      }

      document.dispatchEvent(
        new CustomEvent(EventKeys.submitProgress, {
          detail: {
            progress: totalProgress,
            message: t("submitProgress.uploadingFiles", {
              totalFiles,
            }),
          },
        })
      );
    });
  });

  await Promise.all(uploadPromises);
};
