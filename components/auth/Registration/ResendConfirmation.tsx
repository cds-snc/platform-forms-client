import React, { ReactElement, useState } from "react";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { hasError } from "@lib/hasError";
import { Alert } from "@components/forms";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { Button, StyledLink } from "@components/globals";
import { RegisterStep } from "@pages/signup/register";

interface ResendConfirmationProps {
  username: string;
  nextStepCallback: (step: RegisterStep) => void;
}

export const ResendConfirmation = ({
  username,
  nextStepCallback,
}: ResendConfirmationProps): ReactElement => {
  const { t } = useTranslation(["signup", "cognito-errors", "common"]);
  const [error, setError] = useState("");

  const resendConfirmationAPI = async (username: string) => {
    try {
      await fetchWithCsrfToken("/api/signup/resendconfirmation", { username });
      nextStepCallback(RegisterStep.CONFIRMATION);
    } catch (err) {
      logMessage.error(err);

      if (hasError("TooManyRequestsException", err)) {
        setError(t("signUpConfirmationReSend.errors.tooManyRequests"));
        return;
      }

      setError(t("signUpConfirmationReSend.errors.exception"));

      return err;
    }
  };

  return (
    <>
      {error && <Alert type={ErrorStatus.ERROR} heading={error} id="confirmationErrors"></Alert>}
      <h1 className="border-b-0 mt-6 mb-12">{t("signUpConfirmationReSend.title")}</h1>
      <p>{t("signUpConfirmationReSend.sometimesEmailMessages")}</p>
      <div className="mt-14">
        <Button
          theme="primary"
          onClick={async () => {
            await resendConfirmationAPI(username);
          }}
        >
          {t("signUpConfirmationReSend.reSendCode")}
        </Button>
        <StyledLink theme="secondaryButton" className="ml-4" href="/form-builder/support">
          {t("signUpConfirmationReSend.getSupport")}
        </StyledLink>
      </div>
    </>
  );
};
