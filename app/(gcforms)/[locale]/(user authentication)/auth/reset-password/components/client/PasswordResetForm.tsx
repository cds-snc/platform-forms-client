"use client";

import { useFormState } from "react-dom";
import {
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  Description,
} from "../../../../components/client/forms";
import { useTranslation } from "@i18n/client";
import { SubmitButton } from "./SubmitButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { ErrorStates, resetPassword } from "../../action";

export const PasswordResetForm = ({ email }: { email: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("reset-password");
  const router = useRouter();

  const localFormAction = async (_: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    formData.append("username", email);
    const updatePassword = await resetPassword(language, _, formData);
    if (!updatePassword.authError && !updatePassword.validationErrors) {
      router.push(`/${language}/auth/login`);
    }

    return updatePassword;
  };

  const [state, formAction] = useFormState(localFormAction, {});
  // the form to reset the password with the verification code
  return (
    <>
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
      {state.validationErrors &&
        Object.keys(state.validationErrors).length > 0 &&
        !state.authError && (
          <Alert
            className="w-full"
            type={ErrorStatus.ERROR}
            validation={true}
            tabIndex={0}
            focussable={true}
            id="registrationValidationErrors"
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
      <h1 className="mb-12 mt-6 border-b-0">{t("resetPassword.title")}</h1>
      <form id="resetPassword" action={formAction} noValidate>
        <div className="focus-group">
          <Label
            id="label-confirmationCode"
            htmlFor="confirmationCode"
            className="required"
            required
          >
            {t("resetPassword.fields.confirmationCode.label")}
          </Label>
          <TextInput
            className="h-10 w-36 rounded"
            type="text"
            id="confirmationCode"
            name="confirmationCode"
            required
          />
        </div>
        <div className="focus-group">
          <Label id="label-password" htmlFor="password" className="required" required>
            {t("account.fields.password.label", { ns: "common" })}
          </Label>
          <Description className="text-xl text-black-default" id="password-hint">
            {t("account.fields.password.hint", { ns: "common" })}
          </Description>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type="password"
            id="password"
            name="password"
            ariaDescribedBy="desc-username-hint"
          />
        </div>
        <div className="focus-group">
          <Label
            id="label-passwordConfirmation"
            htmlFor="passwordConfirmation"
            className="required"
            required
          >
            {t("account.fields.passwordConfirmation.label", { ns: "common" })}
          </Label>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type="password"
            id="passwordConfirmation"
            name="passwordConfirmation"
          />
        </div>

        <div className="buttons">
          <SubmitButton text={t("resetPassword.resetPasswordButton")} />
        </div>
      </form>
    </>
  );
};
