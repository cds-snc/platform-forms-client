"use client";
import React, { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Alert } from "./Alert";
import { ErrorListItem } from "./ErrorListItem";
import { Label } from "./Label";
import { TextInput } from "./TextInput";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { register } from "../../action";
import Link from "next/link";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";

import { useFocusIt } from "@lib/hooks/useFocusIt";

const SubmitButton = () => {
  const { t } = useTranslation("signup");
  const { pending } = useFormStatus();
  return (
    <Button
      theme="primary"
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      onClick={() => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "sign_up",
          method: "cognito",
        });
      }}
    >
      {t("signUpRegistration.signUpButton")}
    </Button>
  );
};

export const RegistrationForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["signup", "common"]);

  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });
  const [state, formAction] = useFormState(register.bind(null, language), { validationErrors: [] });

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
      {Object.keys(state.validationErrors).length > 0 && !state.authError && (
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
      <h1 ref={headingRef} className="mb-12 mt-6 border-b-0">
        {t("signUpRegistration.title")}
      </h1>
      <p className="-mt-6 mb-10">
        {t("signUpRegistration.alreadyHaveAnAccount")}&nbsp;
        <Link href={"/auth/login"}>{t("signUpRegistration.alreadyHaveAnAccountLink")}</Link>
      </p>
      <form id="registration" action={formAction} noValidate>
        <div className="focus-group">
          <Label id={"label-name"} htmlFor={"name"} className="required" required>
            {t("signUpRegistration.fields.name.label")}
          </Label>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"text"}
            id={"name"}
            name={"name"}
            validationError={state.validationErrors.find((e) => e.fieldKey === "name")?.fieldValue}
          />
        </div>
        <div className="focus-group">
          <Label id={"label-username"} htmlFor={"username"} className="required" required>
            {t("signUpRegistration.fields.username.label")}
          </Label>
          <div className="mb-2 text-sm" id={"username-hint"}>
            {t("signUpRegistration.fields.username.hint")}
          </div>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"email"}
            id={"username"}
            name={"username"}
            ariaDescribedBy={"username-hint"}
            validationError={
              state.validationErrors.find((e) => e.fieldKey === "username")?.fieldValue
            }
          />
        </div>
        <div className="focus-group">
          <Label id={"label-password"} htmlFor={"password"} className="required" required>
            {t("signUpRegistration.fields.password.label")}
          </Label>
          <div className="mb-2 text-sm text-black" id={"password-hint"}>
            {t("signUpRegistration.fields.password.hintList.title")}
            <ul className="mt-2">
              <li>{t("signUpRegistration.fields.password.hintList.characters")}</li>
              <li>{t("signUpRegistration.fields.password.hintList.number")}</li>
              <li>{t("signUpRegistration.fields.password.hintList.capital")}</li>
              <li>{t("signUpRegistration.fields.password.hintList.symbol")}</li>
            </ul>
          </div>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"password"}
            id={"password"}
            name={"password"}
            ariaDescribedBy={"password-hint"}
            validationError={
              state.validationErrors.find((e) => e.fieldKey === "password")?.fieldValue
            }
          />
        </div>
        <div className="focus-group">
          <Label
            id={"label-passwordConfirmation"}
            htmlFor={"passwordConfirmation"}
            className="required"
            required
          >
            {t("account.fields.passwordConfirmation.label", { ns: "common" })}
          </Label>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type={"password"}
            id={"passwordConfirmation"}
            name={"passwordConfirmation"}
            validationError={
              state.validationErrors.find((e) => e.fieldKey === "passwordConfirmation")?.fieldValue
            }
          />
        </div>
        <p className="-mt-2 mb-10">
          {t("signUpRegistration.termsAgreement")}&nbsp;
          <Link href={"/terms-of-use"}>{t("signUpRegistration.termsAgreementLink")}</Link>
        </p>
        <SubmitButton />
      </form>
    </>
  );
};
