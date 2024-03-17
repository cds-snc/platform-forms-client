"use client";
import React, { useRef, useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { TextInput, Label, Alert, ErrorListItem } from "../../../../components/client/forms";
import { useTranslation } from "@i18n/client";
import { verify } from "../../actions";
import { Expired2faSession } from "./Expired2faSession";
import { Locked2fa } from "./Locked2fa";
import Link from "next/link";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { Button } from "@clientComponents/globals";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { logMessage } from "@lib/logger";

export const MFAForm = ({ authFlowToken }: { authFlowToken?: { value: string; name: string } }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["auth-verify", "common"]);

  const [state, formAction] = useFormState(verify.bind(null, language), {
    validationErrors: [],
  });
  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });

  const [isLocked, setIsLocked] = useState(false);
  const [isExpired, setIsExpired] = useState(() => Boolean(authFlowToken?.value));

  useEffect(() => {
    switch (state.authError?.id) {
      case "2FALockedOutSession":
        setIsLocked(true);
        break;
      case "2FAExpiredSession":
        setIsExpired(true);
        break;
    }
  }, [state.authError]);

  useEffect(() => {
    logMessage.debug(state);
  }, [state]);

  if (isLocked) {
    return <Locked2fa />;
  }

  if (isExpired) {
    return <Expired2faSession />;
  }

  return (
    <>
      <div className="sticky top-0">
        <ToastContainer containerId="default" />
      </div>

      {state.authError && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={state.authError.title}
          focussable={true}
          id="cognitoErrors"
        >
          {state.authError.description}&nbsp;
          {state.authError.callToActionLink ? (
            <Link href={state.authError.callToActionLink}>{state.authError.callToActionText}</Link>
          ) : undefined}
        </Alert>
      )}
      {Object.keys(state.validationErrors).length > 0 && !state.authError && (
        <Alert
          className="w-full"
          type={ErrorStatus.ERROR}
          validation={true}
          tabIndex={0}
          focussable={true}
          id="mfaValidationErrors"
          heading={t("input-validation.heading", { ns: "common" })}
        >
          <ol className="gc-ordered-list p-0">
            {state.validationErrors.map(({ fieldKey, fieldValue }, index) => {
              return (
                <ErrorListItem
                  key={`error-${fieldKey}-${index}`}
                  errorKey={fieldKey}
                  value={fieldValue}
                />
              );
            })}
          </ol>
        </Alert>
      )}
      <h1 data-testid="verify-title" ref={headingRef} className="mb-6 mt-6 border-0">
        {t("verify.title")}
      </h1>
      <p className="mb-12 mt-10">{t("verify.emailHasBeenSent")}</p>
      <form id="verificationCodeForm" action={formAction} noValidate>
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
          <Link className="mr-8" href={`/${language}/auth/mfa/resend`}>
            {t("verify.resendConfirmationCodeButton")}
          </Link>
          <Link href={`/${language}/support`}>{t("verify.help")}</Link>
        </div>
      </form>
    </>
  );
};
