import React, { ReactElement, useState } from "react";
import { useRouter } from "next/router";
import { Formik, FormikHelpers } from "formik";
import { TextInput, Label, Alert, Description } from "@components/forms";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { hasError } from "@lib/hasError";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { logMessage } from "@lib/logger";
import { Button } from "@components/globals";

interface ConfirmationProps {
  username: React.MutableRefObject<string>;
  password: React.MutableRefObject<string>;
  confirmationCallback: () => void;
  shouldSignIn?: boolean;
}

export const Confirmation = ({
  username,
  password,
  confirmationCallback,
  shouldSignIn = true,
}: ConfirmationProps): ReactElement => {
  const router = useRouter();
  const { t } = useTranslation(["signup", "cognito-errors"]);
  const [showSentReconfirmationToast, setShowSentReconfirmationToast] = useState(false);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const confirm = async (
    {
      confirmationCode,
      confirmationCallback,
      shouldSignIn = true,
    }: {
      confirmationCode: string;
      confirmationCallback: () => void;
      shouldSignIn: boolean;
    },
    { setSubmitting, setErrors }: FormikHelpers<{ confirmationCode: string }>
  ) => {
    authErrorsReset();

    let confirmationSuccess = true;
    try {
      await fetchWithCsrfToken("/api/signup/confirm", {
        username: username.current,
        confirmationCode,
      });
    } catch (err) {
      logMessage.error(err);
      confirmationSuccess = false;

      if (hasError("CodeMismatchException", err)) {
        setErrors({ confirmationCode: t("CodeMismatchException") });
        return;
      }
      if (hasError("ExpiredCodeException", err)) {
        setErrors({ confirmationCode: t("ExpiredCodeException") });
        return;
      }
      handleErrorById("InternalServiceException");
    } finally {
      // set the formik submitting state to false
      setSubmitting(false);
    }

    // end the execution of the function if the confirmation did not succeed
    if (!confirmationSuccess) return;

    // if automated sign up is disabled. call the confirmation callback and end the execution
    if (!shouldSignIn) {
      confirmationCallback();
      return;
    }

    // try and sign the user in automatically if shouldSignIn is true, otherwise just
    // call the passed in confirmationCallback
    try {
      const { data } = await axios({
        url: "/api/auth/signin/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          username: username.current,
          password: password.current,
          csrfToken: (await getCsrfToken()) ?? "noToken",
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      if (data?.error) {
        const error = data.error;
        logMessage.error(error);
        if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          handleErrorById("UsernameOrPasswordIncorrect");
        } else {
          handleErrorById("InternalServiceException");
        }
      } else if (data?.ok) {
        await router.push("/auth/policy?referer=/signup/account-created");
      }
    } catch (err) {
      logMessage.error(err);
      handleErrorById("InternalServiceException");
      // Internal error on sign in, not confirmation, so redirect to login page
      await router.push("/auth/login");
    } finally {
      confirmationCallback();
    }
  };

  const resendConfirmationCode = async (username: string) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/signup/resendconfirmation", { username });
    } catch (err) {
      logMessage.error(err);
      if (hasError("TooManyRequestsException", err)) {
        handleErrorById("TooManyRequestsException");
        return;
      }
      handleErrorById("InternalServiceException");
      return err;
    }
  };

  const validationSchema = Yup.object().shape({
    confirmationCode: Yup.string()
      .required(t("signUpConfirmation.fields.confirmationCode.error.notEmpty"))
      .matches(/^[0-9a-z]{5}?$/i, t("signUpConfirmation.fields.confirmationCode.error.length")),
  });

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ confirmationCode: "" }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        setShowSentReconfirmationToast(false);
        await confirm(
          {
            ...values,
            confirmationCallback,
            shouldSignIn,
          },
          formikHelpers
        );
      }}
    >
      {({ handleSubmit }) => (
        <>
          {showSentReconfirmationToast && !authErrorsState?.title && (
            <Alert
              type={ErrorStatus.SUCCESS}
              heading={t("signUpConfirmation.resendConfirmationCode.title")}
              onDismiss={() => {
                setShowSentReconfirmationToast(false);
              }}
              id="reconfirmationSuccess"
              dismissible
            >
              {t("signUpConfirmation.resendConfirmationCode.body")}
            </Alert>
          )}
          {authErrorsState?.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
            >
              {authErrorsState.description}&nbsp;
              {authErrorsState.callToActionLink ? (
                <Link href={authErrorsState.callToActionLink}>
                  {authErrorsState.callToActionText}
                </Link>
              ) : undefined}
            </Alert>
          )}
          {/* {Object.keys(errors).length > 0 && !authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              validation={true}
              tabIndex={0}
              id="confirmationValidationErrors"
              heading={t("input-validation.heading", { ns: "common" })}
            >
              <ol className="gc-ordered-list">
                {Object.entries(errors).map(([fieldKey, fieldValue]) => {
                  return (
                    <ErrorListItem
                      key={`error-${fieldKey}`}
                      errorKey={fieldKey}
                      value={fieldValue}
                    />
                  );
                })}
              </ol>
            </Alert>
          )} */}
          <h1 className="border-0">{t("signUpConfirmation.title")}</h1>
          <p className="mb-10 -mt-6">{t("signUpConfirmation.emailHasBeenSent")}</p>
          <form id="confirmation" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label
                id={"label-confirmationCode"}
                htmlFor="confirmationCode"
                className="required"
                required
              >
                {t("signUpConfirmation.fields.confirmationCode.label")}
              </Label>
              <Description className="text-p text-black-default" id={"confirmationCode-hint"}>
                {t("signUpConfirmation.fields.confirmationCode.description")}
              </Description>
              <TextInput
                className="h-10 w-36 rounded"
                type="text"
                id="confirmationCode"
                name="confirmationCode"
                ariaDescribedBy="confirmationCode-hint"
                required
              />
            </div>
            <Button theme="primary" type="submit">
              {t("signUpConfirmation.confirmButton")}
            </Button>
            <div className="flex mt-10">
              <button
                type="button"
                className="block shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0 mr-8"
                onClick={async () => {
                  const error = await resendConfirmationCode(username.current);
                  if (!error) {
                    setShowSentReconfirmationToast(true);
                  }
                }}
              >
                {t("signUpConfirmation.resendConfirmationCodeButton")}
              </button>
              <Link href={"/form-builder/support"}>{t("signUpConfirmation.help")}</Link>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};
