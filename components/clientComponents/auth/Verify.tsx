"use client";
import React, { ReactElement, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { TextInput, Label, Alert } from "@clientComponents/forms";
import { useTranslation } from "@i18n/client";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { Button } from "@clientComponents/globals";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { logMessage } from "@lib/logger";
import { signIn } from "next-auth/react";
import { hasError } from "@lib/hasError";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { ReVerify } from "./ReVerify";
import { getSession } from "next-auth/react";

import { useFocusIt } from "@lib/hooks/useFocusIt";
import { Locked2fa } from "./Locked2fa";
import { Expired2faSession } from "./Expired2faSession";

interface VerifyProps {
  username: React.MutableRefObject<string>;
  authenticationFlowToken: React.MutableRefObject<string>;
}

export const Verify = ({ username, authenticationFlowToken }: VerifyProps): ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["auth-verify", "cognito-errors", "common"]);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();
  const [isReVerify, setIsReverify] = useState(false);
  const [is2FAlocked, setIs2FAlocked] = useState(false);
  const [is2FAExpiredSession, set2FAExpiredSession] = useState(false);

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef, dependencies: [isReVerify] });

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
      }).catch((err) => {
        if (
          err instanceof TypeError &&
          err.message === "URL constructor: /api/auth is not a valid URL."
        ) {
          // Auth was sucessfull but the redirect failed, so we need to manually redirect
          // Waiting for this fix: https://github.com/nextauthjs/next-auth/issues/9309
          return { ok: true, error: null };
        }
        throw err;
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
      // Ensure the Session Provider is updated and synced with the server
      const session = await getSession();

      if (session) {
        if (session.user.newlyRegistered) {
          return router.push(`/${i18n.language}/auth/policy?referer=/signup/account-created`);
        }

        const response = await fetch("/api/account/submissions/overdue");
        if (response.status === 200) {
          const data = await response.json();
          if (data.hasOverdueSubmissions) {
            return router.push(`/${i18n.language}/auth/restricted-access`);
          }
        }
        return router.push(`/${i18n.language}/auth/policy`);
      }
      throw new Error("Session does not exist after attempted Cognito Sign In");
    } catch (err) {
      logMessage.error(err);

      if (hasError(["CredentialsSignin", "2FALockedOutSession", "2FAExpiredSession"], err)) {
        router.push("/auth/login");
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
      {/* 
         @todo find a way to inclde this in the page metadata<Head>
        <title>{t("verify.title")}</title>
      </Head> */}
      <div className="sticky top-0">
        <ToastContainer containerId="default" />
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
                <Link href={`/${i18n.language}/support`}>{t("verify.help")}</Link>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
