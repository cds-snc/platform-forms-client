"use client";
import React, { useRef, useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { TextInput, Label, Alert, ErrorListItem } from "../../../../components/client/forms";
import { useTranslation } from "@i18n/client";
import { verify, getRedirectPath, ErrorStates } from "../../actions";
import { Expired2faSession } from "./Expired2faSession";
import { Locked2fa } from "./Locked2fa";
import Link from "next/link";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { Loader } from "@clientComponents/globals/Loader";
import { useRouter } from "next/navigation";
import { updateSessionProvider } from "@lib/hooks/auth/updateSessionProvider";

export const MFAForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["auth-verify", "common"]);

  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });

  const [isLocked, setIsLocked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false);
  const [isSubmittingStep2, setIsSubmittingStep2] = useState(false);

  const authToken = useRef<{ email?: string; authenticationFlowToken?: string }>({});

  const router = useRouter();

  useEffect(() => {
    const localToken = JSON.parse(sessionStorage.getItem("authFlowToken") ?? "{}");
    if (!localToken?.authenticationFlowToken || !localToken?.email) {
      setIsExpired(true);
    }
    authToken.current = localToken;
    setIsReady(true);
  }, []);

  const localFormAction = async (_: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    setIsSubmittingStep1(true);
    formData.append("email", authToken.current.email ?? "");
    formData.append("authenticationFlowToken", authToken.current.authenticationFlowToken ?? "");
    const mfaState = await verify(language, _, formData);
    if (mfaState.success) {
      setIsSubmittingStep2(true);
      // Let the Session Provider know that the user has been authenticated
      updateSessionProvider();
      sessionStorage.removeItem("authFlowToken");
      const result = await getRedirectPath(language);
      if (result.callback) router.push(result.callback);
      else router.push(`/${language}/auth/policy`);
      return {};
    }
    // If there are errors re-enable the submit button
    setIsSubmittingStep1(false);
    return mfaState;
  };

  const [state, formAction] = useFormState(localFormAction, {});

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
    if (state.validationErrors) {
      const nonVisualErrors = state.validationErrors.filter(({ fieldValue }) => !fieldValue);
      // If there are no visual errors, then the session is expired because email and authenticationFlowToken
      // didn't pass server side validation
      if (nonVisualErrors.length > 0) {
        setIsExpired(true);
        sessionStorage.removeItem("authFlowToken");
      }
    }
  }, [state.validationErrors]);

  if (!isReady) return <Loader />;

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
      {Array.isArray(state.validationErrors) &&
        state.validationErrors.length > 0 &&
        !state.authError && (
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
                // Filter out validation errors that don't have messages
                if (fieldValue)
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
      {isSubmittingStep2 ? (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      ) : (
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
              validationError={
                state.validationErrors?.find((e) => e.fieldKey === "verificationCode")?.fieldValue
              }
            />
          </div>

          <SubmitButton loading={isSubmittingStep1} dataTestId="verify-submit">
            {t("verify.confirmButton")}
          </SubmitButton>

          <div className="mt-12 flex">
            <Link className="mr-8" href={`/${language}/auth/mfa/resend`}>
              {t("verify.resendConfirmationCodeButton")}
            </Link>
            <Link href={`/${language}/support`}>{t("verify.help")}</Link>
          </div>
        </form>
      )}
    </>
  );
};
