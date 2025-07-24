"use client";
import React, { useEffect, useState, useCallback } from "react";
import { withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation/validation";
import { Alert, RichText } from "@clientComponents/forms";

import { type FormProps, type InnerFormProps } from "./types";
import { type Language } from "@lib/types/form-builder-types";
import { type Responses } from "@lib/types";

import { EventKeys } from "@lib/hooks/useCustomEvent";

import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";

import { ErrorStatus } from "../Alert/Alert";
import {
  submitForm,
  isFormClosed,
} from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import { useFormValuesChanged } from "@lib/hooks/useValueChanged";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Review } from "../Review/Review";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { StatusError } from "../StatusError/StatusError";
import {
  removeFormContextValues,
  getInputHistoryValues,
} from "@lib/utils/form-builder/groupsHistory";
import { filterShownElements, filterValuesByShownElements, FormValues } from "@lib/formContext";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { useFormDelay } from "@lib/hooks/useFormDelayContext";
import { FormActions } from "./FormActions";
import { PrimaryFormButtons } from "./PrimaryFormButtons";
import { FormCaptcha } from "@clientComponents/globals/FormCaptcha/FormCaptcha";
import { FormStatus } from "@gcforms/types";
import { CaptchaFail } from "@clientComponents/globals/FormCaptcha/CaptchaFail";
import { ga } from "@lib/client/clientHelpers";

import { FocusH2 } from "app/(gcforms)/[locale]/(support)/components/client/FocusH2";
import { SubmitProgress } from "@clientComponents/forms/SubmitProgress/SubmitProgress";
import { handleUploadError } from "@lib/fileInput/handleUploadError";

import {
  copyObjectExcludingFileContent,
  uploadFile,
} from "@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/fileUploader";

import { SaveAndResumeButton } from "@clientComponents/forms/SaveAndResume/SaveAndResumeButton";

/**
 * This is the "inner" form component that isn't connected to Formik and just renders a simple form
 * @param props
 */
const InnerForm: React.FC<InnerFormProps> = (props) => {
  const {
    children,
    handleSubmit,
    status,
    language,
    formRecord: { id: formID, form, isPublished },
    dirty,
  }: InnerFormProps = props;

  const { t } = useTranslation();
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);

  const { currentGroup, groupsCheck, getGroupTitle } = useGCFormsContext();
  // TODO: This can be removed in the next refactor.
  const isGroupsCheck = groupsCheck(props.allowGrouping);
  const isShowReviewPage = showReviewPage(form);
  const showIntro = isGroupsCheck ? currentGroup === LockedSections.START : true;
  const { getFormDelayWithGroups, getFormDelayWithoutGroups } = useFormDelay();

  // Used to set any values we'd like added for use in the below withFormik handleSubmit().
  useFormValuesChanged();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;

  let formStatusError = null;
  if (typeof props.status === "object" && props.status !== null && props.status.heading) {
    formStatusError = props.status.heading;
  } else if (props.status === FormStatus.ERROR) {
    formStatusError = t("server-error");
  } else if (props.status === FormStatus.FORM_CLOSED_ERROR) {
    formStatusError =
      (language === "en"
        ? props.formRecord.closedDetails?.messageEn
        : props.formRecord.closedDetails?.messageFr) || t("form-closed-error");
  }

  /* Add save to device button as CTA  if the feature is enabled */
  const cta = props.saveAndResumeEnabled ? (
    <SaveAndResumeButton language={language as Language} />
  ) : null;

  //  If there are errors on the page, set focus the first error field
  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }

    if (!props.isValid && !canFocusOnError) {
      if (props.submitCount > lastSubmitCount) {
        setCanFocusOnError(true);
        setLastSubmitCount(props.submitCount);
      }
    } else if (!props.isValid) {
      setFocusOnErrorMessage(props, errorId);
      setCanFocusOnError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStatusError, errorList, lastSubmitCount, canFocusOnError]);

  const handleSessionSave = useCallback(() => {
    props.saveSessionProgress && props.saveSessionProgress(language as Language);
  }, [language, props]);

  useEffect(() => {
    const beforeUnloadHandler = () => {
      handleSessionSave();
      return null;
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [handleSessionSave]);

  // Show the Captcha fail screen when hCAPTCHA detects a suspicous user
  // Note: check done here vs higher in the tree so the Form session will still exist on the screen
  if (props.captchaFail) {
    return <CaptchaFail />;
  }

  return status === "submitting" ? (
    <>
      <title>{t("loading")}</title>
      <SubmitProgress />
    </>
  ) : (
    <>
      {formStatusError && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={formStatusError}
          tabIndex={0}
          id={serverErrorId}
          cta={cta}
        >
          <>{props.status?.message && <p className="mb-4">{props.status?.message}</p>}</>
        </Alert>
      )}

      {/* ServerId error */}
      {props.status === FormStatus.SERVER_ID_ERROR && (
        <StatusError formId={formID} language={language as Language} />
      )}

      {errorList && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={t("input-validation.heading", {
            lng: language,
          })}
          validation={true}
          id={errorId}
          tabIndex={0}
          focussable={true}
        >
          {errorList}
        </Alert>
      )}

      {
        <>
          {showIntro && (
            <RichText>
              {form.introduction &&
                form.introduction[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
            </RichText>
          )}

          {/* Policy shows before form elements when groups are on */}
          {isGroupsCheck && showIntro && (
            <RichText>
              {form.privacyPolicy &&
                form.privacyPolicy[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
            </RichText>
          )}

          <FormCaptcha
            id="form"
            dataTestId="form"
            lang={language}
            handleSubmit={handleSubmit}
            noValidate={true}
            isPublished={isPublished}
            captchaToken={props.captchaToken}
          >
            {isGroupsCheck &&
              isShowReviewPage &&
              currentGroup !== LockedSections.REVIEW &&
              currentGroup !== LockedSections.START && (
                <FocusH2 group={currentGroup || "default"}>
                  {getGroupTitle(currentGroup, language as Language)}
                </FocusH2>
              )}

            {children}

            {/* Policy shows after form elements when groups off */}
            {!isGroupsCheck && showIntro && (
              <RichText>
                {form.privacyPolicy &&
                  form.privacyPolicy[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
              </RichText>
            )}

            {isGroupsCheck && isShowReviewPage && currentGroup === LockedSections.REVIEW && (
              <Review language={language as Language} />
            )}

            <FormActions
              saveAndResumeEnabled={props.saveAndResumeEnabled || false}
              formId={formID}
              language={language as Language}
              form={form}
              dirty={dirty}
            >
              <PrimaryFormButtons
                saveAndResumeEnabled={props.saveAndResumeEnabled || false}
                isGroupsCheck={isGroupsCheck}
                isShowReviewPage={isShowReviewPage}
                language={language}
                formId={formID}
                formTitle={form.titleEn}
                getFormDelay={() =>
                  isShowReviewPage
                    ? getFormDelayWithGroups()
                    : getFormDelayWithoutGroups(form.elements)
                }
                props={props}
              />
            </FormActions>
          </FormCaptcha>
        </>
      }
    </>
  );
};

/**
 * This is the main Form component that wraps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */

export const Form = withFormik<FormProps, Responses>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => {
    if (props.initialValues) {
      return props.initialValues;
    }
    return getFormInitialValues(props.formRecord, props.language);
  },

  validate: (values, props) => validateOnSubmit(values, props),

  handleSubmit: async (values, formikBag) => {
    // If the form is closed, do not allow submission
    if (await isFormClosed(formikBag.props.formRecord.id)) {
      formikBag.setStatus(FormStatus.FORM_CLOSED_ERROR);
      return;
    }

    // For groups enabled forms only allow submitting on the Review page
    const isShowReviewPage = showReviewPage(formikBag.props.formRecord.form);
    if (isShowReviewPage && formikBag.props.currentGroup !== LockedSections.REVIEW) {
      return;
    }

    const getValuesForConditionalLogic = () => {
      const inputHistoryValues = getInputHistoryValues(
        values,
        values.groupHistory as string[],
        formikBag.props.formRecord.form.groups
      );
      const shownElements = filterShownElements(formikBag.props.formRecord, values as FormValues);
      return filterValuesByShownElements(inputHistoryValues, shownElements);
    };

    // Needed so the Loader is displayed
    formikBag.setStatus("submitting");
    try {
      const hasGroups =
        formHasGroups(formikBag.props.formRecord.form) && formikBag.props.allowGrouping;
      const hasShowHideRules = (values.matchedIds as string[])?.length > 0;
      const formValues =
        hasGroups && hasShowHideRules
          ? removeFormContextValues(getValuesForConditionalLogic())
          : removeFormContextValues(values);

      // Extract file content from formValues so they are not part of the submission call to the submit action
      const { formValuesWithoutFileContent, fileObjsRef } =
        copyObjectExcludingFileContent(formValues);

      const result = await submitForm(
        formValuesWithoutFileContent,
        formikBag.props.language,
        formikBag.props.formRecord.id,
        formikBag.props.captchaToken?.current
      );

      // Failed to find Server Action (likely due to newer deployment)
      if (result === undefined) {
        formikBag.props.saveSessionProgress();
        logMessage.info("Failed to find Server Action caught and session saved");
        formikBag.setStatus(FormStatus.SERVER_ID_ERROR);
        return;
      }
      // Start here to upload files and handle errors below into something easier to read

      if (result.error) {
        if (result.error.name === FormStatus.CAPTCHA_VERIFICATION_ERROR) {
          formikBag.setStatus(FormStatus.CAPTCHA_VERIFICATION_ERROR);
          formikBag.props.setCaptchaFail && formikBag.props.setCaptchaFail(true);
        } else {
          formikBag.setStatus(FormStatus.ERROR);
        }
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

        const uploadPromises = Object.entries(result.fileURLMap).map(
          async ([fileId, signedPost]) => {
            fileProgress[fileId] = 0;
            await uploadFile(fileObjsRef[fileId], signedPost, (ev) => {
              if (!ev.progress || !document) return;

              fileProgress[fileId] = ev.progress;
              const totalProgress =
                Object.values(fileProgress).reduce((acc, progress) => acc + progress, 0) /
                totalFiles;

              document.dispatchEvent(
                new CustomEvent(EventKeys.submitProgress, {
                  detail: {
                    progress: totalProgress,
                    message: formikBag.props.t("submitProgress.uploadingFiles", {
                      totalFiles,
                    }),
                  },
                })
              );
            });
          }
        );

        await Promise.all(uploadPromises);
      }

      formikBag.props.onSuccess(result.id, result?.submissionId);
    } catch (err) {
      logMessage.error(err as Error);

      const fileUploadError = handleUploadError(err as Error, formikBag.props.t);

      if (fileUploadError) {
        formikBag.setStatus({
          heading: fileUploadError.heading,
          message: fileUploadError.message,
        });
      } else {
        formikBag.setStatus("Error");
      }
    } finally {
      if (formikBag.props && !formikBag.props.isPreview) {
        ga("form_submission_trigger", {
          formID: formikBag.props.formRecord.id,
          formTitle: formikBag.props.formRecord.form.titleEn,
        });
      }

      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);
