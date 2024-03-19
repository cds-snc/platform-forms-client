"use client";
import React, { ReactElement, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button, StyledLink } from "@clientComponents/globals";
import { getErrorText, resendVerificationCode } from "../../../actions";

import { hasError } from "@lib/hasError";
import { Alert } from "../../../../../components/client/forms/Alert";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import Link from "next/link";

import { useFocusIt } from "@lib/hooks/useFocusIt";

export const ReVerify = (): ReactElement => {
  const router = useRouter();
  const {
    t,
    i18n: { language },
  } = useTranslation(["auth-verify"]);

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef });

  const [authErrorState, setAuthErrorState] = useState<Record<string, string | undefined>>({});
  const [resending, setResending] = useState(false);

  // If there is no existing flow redirect to login
  const { email, authenticationFlowToken }: { email?: string; authenticationFlowToken?: string } =
    JSON.parse(sessionStorage.getItem("authFlowToken") || "{}");
  if (!email || !authenticationFlowToken) {
    router.push(`/${language}/auth/login`);
  }

  const handleReVerify = async () => {
    try {
      setResending(true);
      if (!email || !authenticationFlowToken) {
        router.push(`/${language}/auth/login`);
        return;
      }
      await resendVerificationCode(language, email, authenticationFlowToken);
    } catch (err) {
      if (hasError(["Missing 2FA session"], err)) {
        // Missing 2FA session so have the user try signing in again
        router.push("/auth/login");
        router.refresh();
      } else {
        // Internal Error
        const errorText = await getErrorText(language, "InternalServiceException");
        setAuthErrorState(errorText);
        setResending(false);
      }
    }
  };

  return (
    <>
      {authErrorState?.title && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={authErrorState?.title}
          onDismiss={() => setAuthErrorState({})}
          id="cognitoErrors"
        >
          {authErrorState.description}&nbsp;
          {authErrorState.callToActionLink ? (
            <Link href={authErrorState.callToActionLink}>{authErrorState.callToActionText}</Link>
          ) : undefined}
        </Alert>
      )}
      <h1 ref={headingRef} className="border-0 mt-6 mb-6">
        {t("reVerify.title")}
      </h1>
      <p className="mt-10">{t("reVerify.description")}</p>
      <div className="flex mt-16">
        <Button theme="primary" className="mr-4" onClick={handleReVerify} disabled={resending}>
          {t("reVerify.buttons.reSendCode")}
        </Button>
        <StyledLink theme="secondaryButton" href={`/${language}/support`}>
          {t("reVerify.buttons.getSupport")}
        </StyledLink>
      </div>
    </>
  );
};
