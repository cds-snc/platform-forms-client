"use client";
import React from "react";
import { useActionState } from "react";
import { TextInput, Label, Alert, ErrorListItem } from "../../../../../components/client/forms";
import { PasswordResetForm } from "./PasswordResetForm";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useTranslation } from "@i18n/client";
import { checkQuestionChallenge } from "../../action";
import Link from "next/link";
import { SecurityQuestion } from "@lib/auth";
import { SubmitButton } from "./SubmitButton";
import { ErrorStatus } from "@lib/constants";

export const QuestionChallengeForm = ({
  email,
  userSecurityQuestions,
}: {
  email: string;
  userSecurityQuestions: SecurityQuestion[];
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["reset-password", "common"]);

  const langKey = language === "en" ? "questionEn" : "questionFr";

  const [state, formAction] = useActionState(checkQuestionChallenge, {});

  const confirmationStage = state.success === true;

  if (confirmationStage) return <PasswordResetForm email={email} />;

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

      <h1 className="mb-12 mt-6 border-b-0">{t("securityQuestions.title")}</h1>
      <p className="mb-6 max-w-lg">{t("securityQuestions.description")}</p>
      <form id="resetPassword" action={formAction} noValidate>
        <input type="hidden" name="question1Id" value={userSecurityQuestions[0].id} />
        <input type="hidden" name="question2Id" value={userSecurityQuestions[1].id} />
        <input type="hidden" name="question3Id" value={userSecurityQuestions[2].id} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="language" value={language} />
        <div className="gcds-input-wrapper">
          <Label
            id="label-question1"
            htmlFor="question1"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[0][langKey]}
          </Label>
          <TextInput
            type="text"
            id="question1"
            name="question1"
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "question1")?.fieldValue
            }
          />
        </div>

        <div className="gcds-input-wrapper">
          <Label
            id="label-question2"
            htmlFor="question2"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[1][langKey]}
          </Label>
          <TextInput
            type="text"
            id="question2"
            name="question2"
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "question2")?.fieldValue
            }
          />
        </div>

        <div className="gcds-input-wrapper">
          <Label
            id="label-question3"
            htmlFor="question3"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[2][langKey]}
          </Label>
          <TextInput
            type="text"
            id="question3"
            name="question3"
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "question3")?.fieldValue
            }
          />
        </div>

        <div className="buttons">
          <SubmitButton text={t("securityQuestions.resetPasswordButton")} />

          <LinkButton.Secondary href={`/${language}/support`}>
            {t("securityQuestions.support")}
          </LinkButton.Secondary>
        </div>
      </form>
    </>
  );
};
