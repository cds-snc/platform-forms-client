import React, { ReactElement } from "react";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { hasError } from "@lib/hasError";
import { TextInput, Label } from "@components/forms";
import { Button } from "@components/globals";

interface ConfirmationProps {
  username: string;
  password: string;
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
  const { t } = useTranslation(["signup", "cognito-errors", "common"]);
  // const [showSentReconfirmationToast, setShowSentReconfirmationToast] = useState(false);

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
    } finally {
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
          username, //: username.current,
          password, //: password.current,
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
        } else {
          // TODO
          // handleErrorById("InternalServiceException");
        }
      } else if (data?.ok) {
        await router.push("/auth/policy?referer=/signup/account-created");
      }
    } catch (err) {
      logMessage.error(err);
      // Internal error on sign in, not confirmation, so redirect to login page
      await router.push("/auth/login");
    } finally {
      confirmationCallback();
    }
  };

  // const resendConfirmationCode = async (username: string) => {
  //   authErrorsReset();
  //   try {
  //     await fetchWithCsrfToken("/api/signup/resendconfirmation", { username });
  //   } catch (err) {
  //     logMessage.error(err);
  //     if (hasError("TooManyRequestsException", err)) {
  //       handleErrorById("TooManyRequestsException");
  //       return;
  //     }
  //     handleErrorById("InternalServiceException");
  //     return err;
  //   }
  // };

  const validationSchema = Yup.object().shape({
    confirmationCode: Yup.string()
      .required(t("signUpConfirmation.fields.confirmationCode.error.notEmpty"))
      .min(5, t("signUpConfirmation.fields.confirmationCode.error.fiveChars"))
      .max(5, t("signUpConfirmation.fields.confirmationCode.error.fiveChars")),
  });

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ username: username, password: password, confirmationCode: "" }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        // setShowSentReconfirmationToast(false);
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
      {({ handleSubmit, errors }) => (
        <>
          {/* {showSentReconfirmationToast && !authErrorsState?.title && (
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
          )} */}
          <h1>{t("signUpConfirmation.title")}</h1>
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
            <div className="mt-12">
              <Link href="/form-builder/support">{t("support.needHelp", { ns: "common" })}</Link>
            </div>

            {/* <button
              type="button"
              className="block my-10 shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0"
              onClick={async () => {
                const error = await resendConfirmationCode(username);
                if (!error) {
                  setShowSentReconfirmationToast(true);
                }
              }}
            >
              {t("signUpConfirmation.resendConfirmationCodeButton")}
            </button> */}
          </form>
        </>
      )}
    </Formik>
  );
};
