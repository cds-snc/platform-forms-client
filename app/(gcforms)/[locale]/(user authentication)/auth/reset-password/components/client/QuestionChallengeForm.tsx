"use client";
import React, { useState } from "react";
import { useFormState } from "react-dom";
import { TextInput, Label, Alert, ErrorListItem } from "../../../../components/client/forms";
import { PasswordResetForm } from "./PasswordResetForm";
import { LinkButton } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { ErrorStates, checkQuestionChallenge } from "../../action";
import Link from "next/link";
import { SecurityQuestion } from "@lib/auth";
import { SubmitButton } from "./SubmitButton";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";

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
  const [confirmationStage, setConfirmationStage] = useState(false);

  const langKey = language === "en" ? "questionEn" : "questionFr";

  const localFormAction = async (_: ErrorStates, formData: FormData): Promise<ErrorStates> => {
    formData.append("question1Id", userSecurityQuestions[0].id);
    formData.append("question2Id", userSecurityQuestions[0].id);
    formData.append("question3Id", userSecurityQuestions[0].id);
    formData.append("email", email);
    const checkResult = await checkQuestionChallenge(language, _, formData);

    if (!checkResult.authError && !checkResult.validationErrors) {
      setConfirmationStage(true);
    }

    return checkResult;
  };

  const [state, formAction] = useFormState(localFormAction, {});
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
        <div className="focus-group">
          <Label
            id="label-question1"
            htmlFor="question1"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[0][langKey]}
          </Label>
          <TextInput
            className="h-10 w-[75%] rounded"
            type="text"
            id="question1"
            name="question1"
            required
          />
        </div>

        <div className="focus-group">
          <Label
            id="label-question2"
            htmlFor="question2"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[1][langKey]}
          </Label>
          <TextInput
            className="h-10 w-[75%] rounded"
            type="text"
            id="question2"
            name="question2"
            required
          />
        </div>

        <div className="focus-group">
          <Label
            id="label-question3"
            htmlFor="question3"
            className="required w-full max-w-lg"
            required
          >
            {userSecurityQuestions[2][langKey]}
          </Label>
          <TextInput
            className="h-10 w-[75%] rounded"
            type="text"
            id="question3"
            name="question3"
            required
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
