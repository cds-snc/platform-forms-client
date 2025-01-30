"use client";
import React, { useEffect, useState, useRef, type JSX, createRef } from "react";
import { FormikProps, withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation/validation";
import { Alert, RichText } from "@clientComponents/forms";
import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";
import { TFunction } from "i18next";
import Loader from "../../globals/Loader";
import { Responses, PublicFormRecord, Validate } from "@lib/types";
import { ErrorStatus } from "../Alert/Alert";
import { submitForm } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import { useFormValuesChanged } from "@lib/hooks/useValueChanged";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Review } from "../Review/Review";
import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { BackButton } from "@formBuilder/[id]/preview/BackButton";
import { Language } from "@lib/types/form-builder-types";
import { BackButtonGroup } from "../BackButtonGroup/BackButtonGroup";
import { StatusError } from "../StatusError/StatusError";
import {
  removeFormContextValues,
  getInputHistoryValues,
} from "@lib/utils/form-builder/groupsHistory";
import { filterShownElements, filterValuesByShownElements } from "@lib/formContext";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { useFormDelay } from "@lib/hooks/useFormDelayContext";
import { SubmitButton } from "./SubmitButton";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Captcha } from "@clientComponents/globals/Captcha/Captcha";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

type InnerFormProps = FormProps & FormikProps<Responses>;

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
  }: InnerFormProps = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);

  const { currentGroup, groupsCheck, getGroupTitle } = useGCFormsContext();
  const isGroupsCheck = groupsCheck(props.allowGrouping);
  const isShowReviewPage = showReviewPage(form);
  const showIntro = isGroupsCheck ? currentGroup === LockedSections.START : true;
  const groupsHeadingRef = useRef<HTMLHeadingElement>(null);

  const { t } = useTranslation();

  const { getFlag } = useFeatureFlags();
  const captchaEnabled = getFlag("hCaptcha");
  const hCaptchaRef = createRef<HCaptcha>();

  // Used to set any values we'd like added for use in the below withFormik handleSubmit().
  useFormValuesChanged();

  const { getFormDelayWithGroups, getFormDelayWithoutGroups } = useFormDelay();

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

          <form
            id="form"
            data-testid="form"
            /**
             * method attribute needs to stay here in case javascript does not load
             * otherwise GET request will be sent which will result in leaking all the user data
             * to the URL
             */
            method="POST"
            onSubmit={(e) => {
              e.preventDefault();
              // For groups enabled forms only allow submitting on the Review page
              if (isGroupsCheck && isShowReviewPage && currentGroup !== LockedSections.REVIEW) {
                return;
              }

              if (captchaEnabled) {
                hCaptchaRef.current?.execute();
              } else {
                handleSubmit(e);
              }
            }}
            noValidate
            // This is needed so dynamic changes e.g. show-hide elements are announced when shown
            // on the form. Though the relationship between the controlling and shown/hidden element
            // is not very clear and can hopefully be improved.
            // For more info and progress see: #4769
            // Also, this this is not ideal because all child elements will inherit the live=polit
            // and any "noisy" child elements should be overridden with aria-live="off" for AT
            // e.g. labels. For more info and caveats see: #4766
            aria-live="polite"
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

            <div className="flex">
              {isGroupsCheck && isShowReviewPage && (
                <BackButtonGroup
                  language={language as Language}
                  onClick={() => groupsHeadingRef.current?.focus()}
                />
              )}
              {props.renderSubmit ? (
                props.renderSubmit({
                  validateForm: props.validateForm,
                  fallBack: () => {
                    return (
                      <div>
                        {isGroupsCheck && isShowReviewPage && (
                          <BackButton
                            language={language as Language}
                            onClick={() => groupsHeadingRef.current?.focus()}
                          />
                        )}
                        <div className="inline-block">
                          <SubmitButton
                            getFormDelay={() =>
                              isShowReviewPage
                                ? getFormDelayWithGroups()
                                : getFormDelayWithoutGroups(form.elements)
                            }
                            formID={formID}
                            formTitle={form.titleEn}
                          />
                        </div>
                      </div>
                    );
                  },
                })
              ) : (
                <SubmitButton
                  getFormDelay={() =>
                    isShowReviewPage
                      ? getFormDelayWithGroups()
                      : getFormDelayWithoutGroups(form.elements)
                  }
                  formID={formID}
                  formTitle={form.titleEn}
                />
              )}
            </div>
          </form>
          {captchaEnabled && (
            <Captcha
              successCb={handleSubmit}
              failCb={() => logMessage.info("TEMP fail failCb")} //TODO
              hCaptchaRef={hCaptchaRef}
              lang={language}
              hCaptchaSiteKey={props.hCaptchaSiteKey}
            />
          )}
        </>
      }
    </>
  );
};

interface FormProps {
  formRecord: PublicFormRecord;
  initialValues?: Responses | undefined;
  language: string;
  isPreview?: boolean;
  renderSubmit?: ({
    validateForm,
    fallBack,
  }: {
    validateForm: Validate["validateForm"];
    fallBack?: () => JSX.Element;
  }) => JSX.Element;
  onSuccess: (id: string) => void;
  children?: (JSX.Element | undefined)[] | null;
  t: TFunction;
  allowGrouping?: boolean | undefined;
  groupHistory?: string[];
  matchedIds?: string[];
  saveProgress: () => void;
  hCaptchaSiteKey: string;
}

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
        formikBag.props.saveProgress();
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
        formikBag.props.onSuccess(result.id);
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
