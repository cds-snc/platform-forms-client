"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation/validation";
import { Alert, RichText } from "@clientComponents/forms";

import { type FormProps, type InnerFormProps } from "./types";
import { type Language } from "@lib/types/form-builder-types";
import { type Responses } from "@lib/types";

import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";

import Loader from "../../globals/Loader";

import { ErrorStatus } from "../Alert/Alert";
import { submitForm } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import { useFormValuesChanged } from "@lib/hooks/useValueChanged";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Review } from "../Review/Review";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { StatusError } from "../StatusError/StatusError";
import {
  removeFormContextValues,
  getInputHistoryValues,
} from "@lib/utils/form-builder/groupsHistory";
import { filterShownElements, filterValuesByShownElements } from "@lib/formContext";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { useFormDelay } from "@lib/hooks/useFormDelayContext";

import { FormActions } from "./FormActions";
import { PrimaryFormButtons } from "./PrimaryFormButtons";
import { FormCaptcha } from "@clientComponents/globals/FormCaptcha/FormCaptcha";
import { CaptchaFail } from "@clientComponents/globals/FormCaptcha/CaptchaFail";

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
    formRecord: { id: formID, form },
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
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);
  const { getFormDelayWithGroups, getFormDelayWithoutGroups } = useFormDelay();

  // Used to set any values we'd like added for use in the below withFormik handleSubmit().
  useFormValuesChanged();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;

  const formStatusError =
    props.status === "FileError"
      ? t("input-validation.file-submission")
      : props.status === "Error"
      ? t("server-error")
      : null;

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
      <Loader message={t("loading")} />
    </>
  ) : (
    <>
      {formStatusError && (
        <Alert type={ErrorStatus.ERROR} heading={formStatusError} tabIndex={0} id={serverErrorId} />
      )}

      {/* ServerId error */}
      {props.status === "ServerIDError" && (
        <StatusError formId={formID} language={language as Language} />
      )}

      {errorList && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={t("input-validation.heading")}
          validation={true}
          id={errorId}
          tabIndex={0}
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
            handleCaptchaFail={() => props.setCaptchaFail && props.setCaptchaFail(true)}
            noValidate={true}
            hCaptchaSiteKey={props.hCaptchaSiteKey}
            blockableMode={false}
            isPreview={props.isPreview}
          >
            {isGroupsCheck &&
              isShowReviewPage &&
              currentGroup !== LockedSections.REVIEW &&
              currentGroup !== LockedSections.START && (
                <h2 className="pb-8" tabIndex={-1} ref={groupsHeadingRef}>
                  {getGroupTitle(currentGroup, language as Language)}
                </h2>
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
      const shownElements = filterShownElements(
        formikBag.props.formRecord.form.elements,
        values.matchedIds as string[]
      );
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

      const result = await submitForm(
        formValues,
        formikBag.props.language,
        formikBag.props.formRecord.id
      );

      // Failed to find Server Action (likely due to newer deployment)
      if (result === undefined) {
        formikBag.props.saveSessionProgress();
        logMessage.info("Failed to find Server Action caught and session saved");
        formikBag.setStatus("ServerIDError");
        return;
      }

      if (result.error) {
        if (result.error.message.includes("FileValidationResult")) {
          formikBag.setStatus("FileError");
        } else {
          formikBag.setStatus("Error");
        }
      } else {
        formikBag.props.onSuccess(result.id, result?.submissionId || undefined);
      }
    } catch (err) {
      logMessage.error(err as Error);
      formikBag.setStatus("Error");
    } finally {
      if (formikBag.props && !formikBag.props.isPreview) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "form_submission_trigger",
          formID: formikBag.props.formRecord.id,
          formTitle: formikBag.props.formRecord.form.titleEn,
        });
      }

      formikBag.setSubmitting(false);
    }
  },
})(InnerForm);
