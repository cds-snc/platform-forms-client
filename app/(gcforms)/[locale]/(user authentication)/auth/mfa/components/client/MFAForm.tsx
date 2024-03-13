"use client";
import React, { useRef } from "react";
import { useFormState } from "react-dom";
import { TextInput, Label, Alert } from "../../../../components/client/forms";
import { useTranslation } from "@i18n/client";
import { verify } from "../../actions";

import Link from "next/link";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { Button } from "@clientComponents/globals";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { useFocusIt } from "@lib/hooks/useFocusIt";

export const MFAForm = ({
  username,
  authenticationFlowToken,
}: {
  username: string;
  authenticationFlowToken: string;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["auth-verify"]);
  const [state, formAction] = useFormState(
    verify.bind(null, language, username, authenticationFlowToken),
    {
      validationErrors: [],
    }
  );
  // const [isResend, setIsResend] = useState(false);
  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });

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
          <Button theme="link" className="mr-8" onClick={() => /* setIsResend(true)*/ null}>
            {t("verify.resendConfirmationCodeButton")}
          </Button>
          <Link href={`/${language}/support`}>{t("verify.help")}</Link>
        </div>
      </form>
    </>
  );
};
