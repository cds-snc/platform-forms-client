import React, { ReactElement, useState } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { TextInput, Label, Alert } from "@components/forms";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { Button } from "@components/globals";
import { toast, ToastContainer } from "@components/form-builder/app/shared/Toast";
import { logMessage } from "@lib/logger";
import { signIn } from "next-auth/react";
import { hasError } from "@lib/hasError";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { ReVerify } from "./ReVerify";

interface VerifyProps {
  username: React.MutableRefObject<string>;
  authenticationFlowToken: React.MutableRefObject<string>;
}

export const Verify = ({ username, authenticationFlowToken }: VerifyProps): ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["auth-verify", "cognito-errors", "common"]);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();
  const [isReVerify, setIsReverify] = useState(false);

  const handleVerify = async ({ verificationCode }: { verificationCode: string }) => {
    authErrorsReset();
    try {
      const data = await signIn("cognito", {
        username: username.current,
        verificationCode: verificationCode,
        authenticationFlowToken: authenticationFlowToken.current,
        redirect: false,
        json: true,
      });

      // Failed
      if (data && !data?.ok) {
        const error = data?.error;
        if (error) {
          handleErrorById(error);
        }
        return;
      }

      // Success
      if (data) {
        router.push({
          pathname: `/${i18n.language}/auth/policy`,
          search: "?referer=/signup/account-created",
        });
      }
    } catch (err) {
      logMessage.error(err);

      if (hasError(["CredentialsSignin", "CSRF token not found"], err)) {
        // Missing CsrfToken or username so have the user try signing in
        await router.push("/auth/login");
      } else if (hasError("2FAInvalidVerificationCode", err)) {
        handleErrorById("2FAInvalidVerificationCode");
      } else if (hasError("CodeMismatchException", err)) {
        handleErrorById("CodeMismatchException");
      } else if (hasError("ExpiredCodeException", err)) {
        handleErrorById("ExpiredCodeException");
      } else if (hasError("2FAExpiredSession", err)) {
        handleErrorById("2FAExpiredSession");
      } else if (hasError("TooManyRequestsException", err)) {
        handleErrorById("TooManyRequestsException");
      } else {
        handleErrorById("InternalServiceException");
      }
    }
  };

  const validationSchema = Yup.object().shape({
    verificationCode: Yup.string()
      .required(t("verify.fields.confirmationCode.error.notEmpty"))
      .matches(/^[a-z0-9]*$/i, t("verify.fields.confirmationCode.error.noSymbols"))
      .matches(/^[a-z0-9]{5}$/i, t("verify.fields.confirmationCode.error.length")),
  });

  if (isReVerify) {
    return (
      <ReVerify
        username={username}
        authenticationFlowToken={authenticationFlowToken}
        callback={() => {
          setIsReverify(false);
          // TODO: look into why the timeout is needed
          setTimeout(() => toast.success(t("reVerify.newCodeSent")), 40);
        }}
      />
    );
  }

  return (
    <>
      <div className="sticky top-0">
        <ToastContainer autoClose={false} />
      </div>
      <Formik
        initialValues={{ verificationCode: "" }}
        onSubmit={handleVerify}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        onReset={authErrorsReset}
      >
        {({ handleSubmit }) => (
          <>
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
            <h1 className="border-0 mt-6 mb-6">{t("verify.title")}</h1>
            <p className="mt-10 mb-12">{t("verify.emailHasBeenSent")}</p>
            <form id="verificationCodeForm" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label
                  id={"label-verificationCode"}
                  htmlFor="verificationCode"
                  className="required"
                  required
                >
                  {t("verify.fields.confirmationCode.label")}
                </Label>
                <div className="text-p text-black-default mb-2" id={"verificationCode-hint"}>
                  {t("verify.fields.confirmationCode.description")}
                </div>
                <TextInput
                  className="h-10 w-36 rounded"
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  ariaDescribedBy="verificationCode-hint"
                  required
                />
              </div>
              <Button theme="primary" type="submit">
                {t("verify.confirmButton")}
              </Button>
              <div className="flex mt-12">
                {/* Note: this is a special button that looks like a link with specific styling. Otherwise the Button component should be used */}
                <button
                  type="button"
                  className="block shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0 mr-8"
                  onClick={() => setIsReverify(true)}
                >
                  {t("verify.resendConfirmationCodeButton")}
                </button>
                <Link href={"/form-builder/support"}>{t("verify.help")}</Link>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
