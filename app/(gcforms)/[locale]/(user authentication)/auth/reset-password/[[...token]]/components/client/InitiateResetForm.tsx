"use client";
import React, { useState } from "react";
import { useFormState } from "react-dom";

import {
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  Description,
} from "../../../../../components/client/forms";
import { LinkButton } from "@serverComponents/globals";
import { useTranslation } from "@i18n/client";
import { sendResetLink, ErrorStates } from "../../action";
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

  const [linkSent, setLinkSent] = useState(false);

  const localFormAction = async (_: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    const submitResult = await sendResetLink(language, _, formData);
    if (submitResult.validationErrors || submitResult.authError) {
      return submitResult;
    }
    setLinkSent(true);
    return {};
  };

  const [state, formAction] = useFormState(localFormAction, {});

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
        <div className="focus-group">
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
