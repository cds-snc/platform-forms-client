"use client";
import React from "react";
import { useActionState } from "react";
import {
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  Description,
} from "../../../../../components/client/forms";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useTranslation } from "@i18n/client";
import { sendResetLink } from "../../action";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { SubmitButton } from "./SubmitButton";

export const InitiateResetForm = ({
  confirmationPage,
  errorPage,
}: {
  confirmationPage: React.ReactElement;
  errorPage: React.ReactElement;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["reset-password", "common"]);

  const [state, formAction] = useActionState(sendResetLink, {});

  const linkSent = state.success === true;

  if (linkSent) return confirmationPage;
  if (state.authError) return errorPage;

  return (
    <>
      {state.authError && errorPage}
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
      <h1 className="mb-12 mt-6 border-b-0">{t("provideUsername.title")}</h1>
      <form id="provideUsername" action={formAction} noValidate>
        <input type="hidden" name="language" value={language} />
        <div className="gcds-input-wrapper">
          <Label id="label-username" htmlFor="username" className="required" required>
            {t("provideUsername.fields.username.label")}
          </Label>
          <Description id="username-hint" className="text-black">
            {t("provideUsername.fields.username.hint")}
          </Description>
          <TextInput
            className="h-10 w-full max-w-lg rounded"
            type="email"
            id="username"
            name="username"
            ariaDescribedBy="desc-username-hint"
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "username")?.fieldValue
            }
          />
        </div>

        <SubmitButton text={t("provideUsername.resetPasswordButton")} />

        <LinkButton.Secondary href={`/${language}/auth/login`}>
          {t("account.actions.backToSignIn", { ns: "common" })}
        </LinkButton.Secondary>
      </form>
    </>
  );
};
