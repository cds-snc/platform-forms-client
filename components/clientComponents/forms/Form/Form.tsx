"use client";
import React, { useEffect, useState, useRef } from "react";
import { FormikProps, withFormik } from "formik";
import { getFormInitialValues } from "@lib/formBuilder";
import { getErrorList, setFocusOnErrorMessage, validateOnSubmit } from "@lib/validation/validation";
import { Alert, Button, RichText } from "@clientComponents/forms";
import { logMessage } from "@lib/logger";
import { useTranslation } from "@i18n/client";
import { TFunction } from "i18next";
import Loader from "../../globals/Loader";
import classNames from "classnames";
import { Responses, PublicFormRecord, Validate } from "@lib/types";
import { ErrorStatus } from "../Alert/Alert";
import { submitForm } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/actions";
import useFormTimer from "@lib/hooks/useFormTimer";
import { useFormValuesChanged } from "@lib/hooks/useValueChanged";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Review } from "../Review/Review";

interface SubmitButtonProps {
  numberOfRequiredQuestions: number;
  formID: string;
  formTitle: string;
}
const SubmitButton: React.FC<SubmitButtonProps> = ({
  numberOfRequiredQuestions,
  formID,
  formTitle,
}) => {
  const { t } = useTranslation();
  const [formTimerState, { startTimer, checkTimer, disableTimer }] = useFormTimer();
  const [submitTooEarly, setSubmitTooEarly] = useState(false);
  const screenReaderRemainingTime = useRef(formTimerState.remainingTime);

  // calculate initial delay for submit timer
  const secondsBaseDelay = 2;
  const secondsPerFormElement = 2;
  const submitDelaySeconds = secondsBaseDelay + numberOfRequiredQuestions * secondsPerFormElement;

  const formTimerEnabled = process.env.NEXT_PUBLIC_APP_ENV !== "test";

  // If the timer hasn't started yet, start the timer
  if (!formTimerState.timerDelay && formTimerEnabled) startTimer(submitDelaySeconds);

  useEffect(() => {
    if (!formTimerEnabled && !formTimerState.canSubmit) {
      disableTimer();
    }
  }, [disableTimer, formTimerEnabled, formTimerState.canSubmit]);

  useEffect(() => {
    if (formTimerEnabled) {
      // Initiate a callback to ensure that state of submit button is correctly displayed

      // Calling the checkTimer modifies the state of the formTimerState
      // Which recalls this useEffect at least every second
      const timerID = setTimeout(() => checkTimer(), 1000);

      return () => {
        clearTimeout(timerID);
      };
    }
  }, [checkTimer, formTimerState.timerDelay, formTimerEnabled]);

  return (
    <>
      <div
        className={classNames({
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
    formRecord: { id: formID, form },
  }: InnerFormProps = props;
  const [canFocusOnError, setCanFocusOnError] = useState(false);
  const [lastSubmitCount, setLastSubmitCount] = useState(-1);

  // Used to determine to show the intro text or not
  const { currentGroup } = useGCFormsContext();
  const allowGrouping = props.allowGrouping ?? false;
  const showIntro = allowGrouping ? currentGroup === "start" : true;

  const { t } = useTranslation();

  useFormValuesChanged();

  const errorList = props.errors ? getErrorList(props) : null;
  const errorId = "gc-form-errors";
  const serverErrorId = `${errorId}-server`;
  const formStatusError = props.status === "Error" ? t("server-error") : null;

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

  const numberOfRequiredQuestions = form.elements.filter(
    (element) => element.properties.validation?.required === true
  ).length;

  return status === "submitting" ? (
    <Loader message={t("loading")} />
  ) : (
    <>
      {formStatusError && (
        <Alert type={ErrorStatus.ERROR} heading={formStatusError} tabIndex={0} id={serverErrorId} />
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
              handleSubmit(e);
            }}
            noValidate
            // TODO move this to each child container but that I think will take some thought.
            aria-live="polite"
          >
            {children}

            {showIntro && (
              <RichText>
                {form.privacyPolicy &&
                  form.privacyPolicy[props.language == "en" ? "descriptionEn" : "descriptionFr"]}
              </RichText>
            )}

            {/* TODO use an enum */}
            {allowGrouping && currentGroup === "review" && <Review />}

            {props.renderSubmit ? (
              props.renderSubmit({
                validateForm: props.validateForm,
                fallBack: () => {
                  return (
                    <SubmitButton
                      numberOfRequiredQuestions={numberOfRequiredQuestions}
                      formID={formID}
                      formTitle={form.titleEn}
                    />
                  );
                },
              })
            ) : (
              <SubmitButton
                numberOfRequiredQuestions={numberOfRequiredQuestions}
                formID={formID}
                formTitle={form.titleEn}
              />
            )}
          </form>
        </>
      }
    </>
  );
};

interface FormProps {
  formRecord: PublicFormRecord;
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
  allowGrouping: boolean | undefined;
}

/**
 * This is the main Form component that wraps "InnerForm" withFormik hook, giving all of its components context
 * @param props
 */

export const Form = withFormik<FormProps, Responses>({
  validateOnChange: false,

  validateOnBlur: false,

  enableReinitialize: true, // needed when switching languages

  mapPropsToValues: (props) => getFormInitialValues(props.formRecord, props.language),

  validate: (values, props) => validateOnSubmit(values, props),

  handleSubmit: async (values, formikBag) => {
    // Needed so the Loader is displayed
    formikBag.setStatus("submitting");
    try {
      const result = await submitForm(values, formikBag.props.language, formikBag.props.formRecord);
      result && formikBag.props.onSuccess(result);
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
