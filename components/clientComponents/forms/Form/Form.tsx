"use client";
import React, { useEffect, useState, useRef, type JSX } from "react";
import { FormikProps, withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation/validation";
import { Alert, RichText } from "@clientComponents/forms";
import { Button } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";
import { TFunction } from "i18next";
import Loader from "../../globals/Loader";
import { cn } from "@lib/utils";
import { Responses, PublicFormRecord, Validate } from "@lib/types";
import { ErrorStatus } from "../Alert/Alert";
import { submitForm } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import useFormTimer from "@lib/hooks/useFormTimer";
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
import { filterShownElements, filterResponsesByShownElements } from "@lib/formContext";
import { showReviewPage } from "@lib/utils/form-builder/showReviewPage";
import { useFormDelay } from "@lib/hooks/useFormDelayContext";

interface SubmitButtonProps {
  getFormDelay: () => number;
  formID: string;
  formTitle: string;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({ getFormDelay, formID, formTitle }) => {
  const { t } = useTranslation();
  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();
  const [submitTooEarly, setSubmitTooEarly] = useState(false);
  const screenReaderRemainingTime = useRef(formTimerState.remainingTime);
  const formDelay = useRef(getFormDelay());

  // If the formDelay is less than 0 or the app is in test mode, disable the timer
  // because the user has already spent enough time on the form.

  const formTimerEnabled = process.env.NEXT_PUBLIC_APP_ENV !== "test" && formDelay.current > 0;

  // The empty array of dependencies ensures that this useEffect only runs once on mount
  useEffect(() => {
    if (formTimerEnabled) {
      logMessage.debug(`Starting Form Timer with delay: ${formDelay.current}`);
      startTimer(formDelay.current);
    } else {
      disableTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formTimerEnabled && formTimerState.remainingTime > 0) {
      // Initiate a callback to ensure that state of submit button is correctly displayed

      // Calling the checkTimer modifies the state of the formTimerState
      // Which recalls this useEffect at least every second
      const timerID = setTimeout(() => checkTimer(), 1000);

      return () => {
        clearTimeout(timerID);
      };
    }
  }, [checkTimer, formTimerState.remainingTime, formTimerEnabled]);

  return (
    <>
      <div
        className={cn({
          "border-l-2": submitTooEarly,
          "border-red-default": submitTooEarly && formTimerState.remainingTime > 0,
          "border-green-default": submitTooEarly && formTimerState.remainingTime === 0,
          "pl-3": submitTooEarly,
        })}
      >
        {submitTooEarly &&
          (formTimerState.remainingTime > 0 ? (
            <>
              <div role="alert" className="gc-label text-red-default">
                {t("spam-error.error-part-1")} {formTimerState.timerDelay}{" "}
                {t("spam-error.error-part-2")}
                <span className="sr-only">
                  {" "}
                  {t("spam-error.prompt-part-1")} {screenReaderRemainingTime.current}{" "}
                  {t("spam-error.prompt-part-2")}
                </span>
              </div>
              <div aria-hidden={true} className="gc-description">
                {t("spam-error.prompt-part-1")} {formTimerState.remainingTime}{" "}
                {t("spam-error.prompt-part-2")}
              </div>
            </>
          ) : (
            <div role="alert">
              <p className="gc-label text-green-default">{t("spam-error.success-message")}</p>
              <p className="gc-description">{t("spam-error.success-prompt")}</p>
            </div>
          ))}
      </div>
      <Button
        id="form-submit-button"
        type="submit"
        onClick={(e) => {
          if (formTimerEnabled) checkTimer();
          screenReaderRemainingTime.current = formTimerState.remainingTime;
          if (!formTimerState.canSubmit) {
            e.preventDefault();
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "form_submission_spam_trigger",
              formID: formID,
              formTitle: formTitle,
              submitTime: formTimerState.remainingTime,
            });

            setSubmitTooEarly(true);
            // In case the useEffect timer failed check again
            return;
          }
          // Only change state if submitTooEarly is already set to true
          submitTooEarly && setSubmitTooEarly(false);
        }}
      >
        {t("submitButton")}
      </Button>
    </>
  );
};

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
              handleSubmit(e);
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
    const getValues = () => {
      const inputHistoryValues = getInputHistoryValues(
        values,
        values.groupHistory as string[],
        formikBag.props.formRecord.form.groups
      );
      const shownElements = filterShownElements(
        formikBag.props.formRecord.form.elements,
        values.matchedIds as string[]
      );
      const shownResponses = filterResponsesByShownElements(inputHistoryValues, shownElements);
      return removeFormContextValues(shownResponses);
    };

    // Needed so the Loader is displayed
    formikBag.setStatus("submitting");
    try {
      const result = await submitForm(
        getValues(),
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
