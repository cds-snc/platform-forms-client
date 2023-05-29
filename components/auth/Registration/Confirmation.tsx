import React, { ReactElement } from "react";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import { useRouter } from "next/router";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { hasError } from "@lib/hasError";
import { TextInput, Label } from "@components/forms";
import { Button } from "@components/globals";
import { RegisterStep } from "@pages/signup/register";

interface ConfirmationProps {
  username: string;
  password: string;
  nextStepCallback: (step: RegisterStep) => void;
  shouldSignIn?: boolean;
  canResendCode?: boolean;
}

// TODO: When refactoring, look over the logic below. Much of this could be removed I think.
export const Confirmation = ({
  username,
  password,
  nextStepCallback,
  shouldSignIn = true,
  canResendCode = false,
}: ConfirmationProps): ReactElement => {
  const router = useRouter();
  const { t } = useTranslation(["signup", "cognito-errors", "common"]);

  const confirmationAPI = async (
    {
      confirmationCode,
      shouldSignIn = true,
    }: {
      confirmationCode: string;
      shouldSignIn: boolean;
    },
    {
      setSubmitting,
      setErrors,
    }: FormikHelpers<{ username: string; password: string; confirmationCode: string }>
  ) => {
    let confirmationSuccess = true;
    try {
      await fetchWithCsrfToken("/api/signup/confirm", { username, confirmationCode });
    } catch (err) {
      logMessage.error(err);
      confirmationSuccess = false;

      if (hasError("CodeMismatchException", err)) {
        setErrors({
          confirmationCode: t("signUpConfirmation.fields.confirmationCode.error.notFound"),
        });
        return;
      }
      if (hasError("ExpiredCodeException", err)) {
        setErrors({
          confirmationCode: t("signUpConfirmation.fields.confirmationCode.error.expired"),
        });
        return;
      }

      setErrors({
        confirmationCode: t("signUpConfirmation.fields.confirmationCode.error.exception"),
      });
    } finally {
      setSubmitting(false);
    }

    // end the execution of the function if the confirmation did not succeed
    if (!confirmationSuccess) return;

    // if automated sign up is disabled. call the confirmation callback and end the execution
    if (!shouldSignIn) {
      return;
    }

    // try and sign the user in automatically if shouldSignIn is true, otherwise just
    // call the passed in verificationCallback
    try {
      const { data } = await axios({
        url: "/api/auth/signin/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          username,
          password,
          csrfToken: (await getCsrfToken()) ?? "noToken",
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      if (data?.error) {
        const error = data.error;
        logMessage.error(error);
        if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          // Not authorized handled in catch
          throw Error(error);
        }

        setErrors({
          confirmationCode: t("signUpConfirmation.fields.confirmationCode.error.exception"),
        });
      } else if (data?.ok) {
        await router.push("/auth/policy?referer=/signup/account-created");
      }
    } catch (err) {
      logMessage.error(err);
      // Internal error on sign in, not confirmation, so redirect to login page
      await router.push("/auth/login");
    }
  };

  const validationSchema = Yup.object().shape({
    confirmationCode: Yup.string()
      .required(t("signUpConfirmation.fields.confirmationCode.error.notEmpty"))
      .matches(/^[0-9]{6}?$/, t("signUpConfirmation.fields.confirmationCode.error.sixNumbers")),
  });

  return (
    <>
      <Formik
        validationSchema={validationSchema}
        initialValues={{ username: username, password: password, confirmationCode: "" }}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={async (values, formikHelpers) => {
          await confirmationAPI(
            {
              ...values,
              shouldSignIn,
            },
            formikHelpers
          );
        }}
      >
        {({ handleSubmit }) => (
          <>
            <h1 className="border-b-0 mt-6 mb-12">{t("signUpConfirmation.title")}</h1>
            <p className="mb-10 -mt-6">{t("signUpConfirmation.description")}</p>
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
                <div className="text-p text-black-default mb-2" id="confirmationCode-hint">
                  {t("signUpConfirmation.fields.confirmationCode.description")}
                </div>
                <TextInput
                  className="h-10 w-36 rounded"
                  type="text"
                  id="confirmationCode"
                  name="confirmationCode"
                  aria-describedby="confirmationCode-hint"
                  required
                />
              </div>
              <Button type="submit" theme="primary">
                {t("signUpConfirmation.confirmButton")}
              </Button>

              {canResendCode && (
                <div className="mt-12">
                  <Button
                    theme="link"
                    onClick={() => {
                      nextStepCallback(RegisterStep.RESEND_CONFIRMATION);
                    }}
                  >
                    {t("signUpConfirmation.resendConfirmationCodeButton")}
                  </Button>
                </div>
              )}
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
