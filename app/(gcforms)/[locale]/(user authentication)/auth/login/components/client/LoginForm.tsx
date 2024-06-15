"use client";

import { useFormStatus, useFormState } from "react-dom";
import { Alert, ErrorListItem, Label, TextInput } from "../../../../components/client/forms";
import { useTranslation } from "@i18n/client";
import { login, ErrorStates } from "../../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";

const ButtonSubmit = () => {
  const { t } = useTranslation("login");
  const { pending } = useFormStatus();
  return <SubmitButton loading={pending}>{t("continueButton")}</SubmitButton>;
};

export const LoginForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["login", "cognito-errors", "common"]);

  const localFormAction = async (_: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    const result = await login(language, _, formData);
    if (result.authFlowToken) {
      sessionStorage.setItem("authFlowToken", JSON.stringify(result.authFlowToken));
      router.push(`/${language}/auth/mfa`);
    }
    return result;
  };
  const [state, formAction] = useFormState(localFormAction, {});
  const router = useRouter();

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
            id="loginValidationErrors"
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
      <h1 className="mb-12 mt-6 border-b-0">{t("title")}</h1>
      <p className="-mt-6 mb-10">
        {t("signUpText")}&nbsp;
        <Link href={`/${language}/auth/register`}>{t("signUpLink")}</Link>
      </p>
      <form id="login" action={formAction} noValidate>
        <div className="focus-group">
          <Label id={"label-username"} htmlFor={"username"} className="required" required>
            {t("fields.username.label")}
          </Label>
          <div className="mb-2 text-sm text-black" id="login-description">
            {t("fields.username.description")}
          </div>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"email"}
            id={"username"}
            name={"username"}
            required
            ariaDescribedBy="login-description"
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "username")?.fieldValue
            }
          />
        </div>
        <div className="focus-group">
          <Label id={"label-password"} htmlFor={"password"} className="required" required>
            {t("fields.password.label")}
          </Label>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"password"}
            id={"password"}
            name={"password"}
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "password")?.fieldValue
            }
          />
        </div>
        <p className="-mt-6 mb-10">
          <Link href={`/${language}/auth/reset-password`} className="-mt-8 mb-10">
            {t("resetPasswordText")}
          </Link>
        </p>
        <ButtonSubmit />
      </form>
    </>
  );
};
