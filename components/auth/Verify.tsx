import React, { ReactElement, useState, useEffect, useRef } from "react";
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
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { Locked2fa } from "./Locked2fa";
import { Expired2faSession } from "./Expired2faSession";

interface VerifyProps {
  username: React.MutableRefObject<string>;
  authenticationFlowToken: React.MutableRefObject<string>;
  type: "login" | "register";
}

export const Verify = ({
  username,
  authenticationFlowToken,
  type = "login",
}: VerifyProps): ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["auth-verify", "cognito-errors", "common"]);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();
  const [isReVerify, setIsReverify] = useState(false);
  const [is2FAlocked, setIs2FAlocked] = useState(false);
  const [is2FAExpiredSession, set2FAExpiredSession] = useState(false);
  const { data: session, status: authStatus } = useSession();

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef, dependencies: [isReVerify] });

  useEffect(() => {
    if (authStatus === "authenticated") {
      if (session.user.newlyRegistered) {
        router.push({
          pathname: `/${i18n.language}/auth/policy`,
          search: "?referer=/signup/account-created",
        });
      } else {
        router.push({
          pathname: `/${i18n.language}/auth/policy`,
        });
      }
    }
  }, [session, authStatus, router, i18n.language]);

  const handleVerify = async ({ verificationCode }: { verificationCode: string }) => {
    authErrorsReset();
    setIs2FAlocked(false);
    try {
      const result = await signIn("cognito", {
        username: username.current,
        verificationCode: verificationCode,
        authenticationFlowToken: authenticationFlowToken.current,
        redirect: false,
        json: true,
      });

      // Failed
      if (!result?.ok) {
        const error = result?.error;
        if (error) {
          if (error === "2FALockedOutSession") {
            setIs2FAlocked(true);
          } else if (error === "2FAExpiredSession") {
            set2FAExpiredSession(true);
          } else {
            handleErrorById(error);
          }
        }
        return;
      }

      // Success
      if (result) {
        const response = await fetch("/api/account/submissions/overdue");
        if (response.status === 200) {
          const data = await response.json();

          if (data.hasOverdueSubmissions) {
            router.push({
              pathname: `/${i18n.language}/auth/restricted-access`,
            });
            return;
          }
        }

        router.push({
          pathname: `/${i18n.language}/auth/policy`,
          search: type === "register" ? "?referer=/signup/account-created" : "",
        });
      }
    } catch (err) {
      logMessage.error(err);

      if (hasError(["CredentialsSignin", "2FALockedOutSession", "2FAExpiredSession"], err)) {
        await router.push("/auth/login");
      } else if (hasError("2FAInvalidVerificationCode", err)) {
        handleErrorById("2FAInvalidVerificationCode");
      } else if (hasError("CodeMismatchException", err)) {
        handleErrorById("CodeMismatchException");
      } else if (hasError("ExpiredCodeException", err)) {
        handleErrorById("ExpiredCodeException");
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

  if (is2FAlocked) {
    return <Locked2fa />;
  }

  if (is2FAExpiredSession) {
    return <Expired2faSession />;
  }

  if (isReVerify) {
    return (
      <ReVerify
        username={username}
        authenticationFlowToken={authenticationFlowToken}
        callback={() => {
          authErrorsReset();
          setIsReverify(false);
          // TODO: look into why the timeout is needed
          setTimeout(() => toast.success(t("reVerify.newCodeSent")), 40);
        }}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{t("verify.title")}</title>
      </Head>
      <div className="sticky top-0">
        <ToastContainer />
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
                focussable={true}
                id="cognitoErrors"
                className="w-full [&>div>h2]:pb-0"
              >
                {authErrorsState.description}{" "}
                {authErrorsState.callToActionLink ? (
                  <Link href={authErrorsState.callToActionLink}>
                    {authErrorsState.callToActionText}
                  </Link>
                ) : undefined}
              </Alert>
            )}
            <h1 data-testid="verify-title" ref={headingRef} className="mb-6 mt-6 border-0">
              {t("verify.title")}
            </h1>
            <p className="mb-12 mt-10">{t("verify.emailHasBeenSent")}</p>
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
                <div className="mb-2 text-sm text-black-default" id={"verificationCode-hint"}>
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
              <Button theme="primary" type="submit" dataTestId="verify-submit">
                {t("verify.confirmButton")}
              </Button>
              <div className="mt-12 flex">
                <Button theme="link" className="mr-8" onClick={() => setIsReverify(true)}>
                  {t("verify.resendConfirmationCodeButton")}
                </Button>
                <Link href={"/form-builder/support"}>{t("verify.help")}</Link>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
