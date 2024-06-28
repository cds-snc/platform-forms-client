"use client";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { getErrorText, resendVerificationCode } from "../../../actions";

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

  // Makes sure NextJS will not try to render sessionStorage on the server
  const existingFlow = useRef({} as { email?: string; authenticationFlowToken?: string });
  useEffect(() => {
    existingFlow.current = JSON.parse(sessionStorage.getItem("authFlowToken") || "{}");
    if (!existingFlow.current.email || !existingFlow.current.authenticationFlowToken) {
      router.push(`/${language}/auth/login`);
    }
  }, [language, router]);

  const handleReVerify = async () => {
    setResending(true);
    if (!existingFlow.current.email || !existingFlow.current.authenticationFlowToken) {
      router.push(`/${language}/auth/login`);
      return;
    }
    const result = await resendVerificationCode(
      language,
      existingFlow.current.email,
      existingFlow.current.authenticationFlowToken
    );

    if (result?.error) {
      // Internal Error
      const errorText = await getErrorText(language, "InternalServiceException");
      setAuthErrorState(errorText);
      setResending(false);
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
        <LinkButton.Secondary href={`/${language}/support`}>
          {t("reVerify.buttons.getSupport")}
        </LinkButton.Secondary>
      </div>
    </>
  );
};
