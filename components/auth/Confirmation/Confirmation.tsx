import React, { ReactElement, useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { useConfirm } from "@lib/hooks/auth";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";

interface ConfirmationProps {
  username: string;
  password: string;
  confirmationCallback: () => void;
  shouldSignIn?: boolean;
}

export const Confirmation = ({
  username,
  password,
  confirmationCallback,
  shouldSignIn = true,
}: ConfirmationProps): ReactElement => {
  const { confirm, resendConfirmationCode, authErrorsState, authErrorsReset } = useConfirm();
  const [showSentReconfirmationToast, setShowSentReconfirmationToast] = useState(false);
  const { t } = useTranslation(["signup", "cognito-errors", "common"]);

  const validationSchema = Yup.object().shape({
    confirmationCode: Yup.number()
      .typeError(t("signUpConfirmation.fields.confirmationCode.error.number"))
      .required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ username: username, password: password, confirmationCode: "" }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        setShowSentReconfirmationToast(false);
        await confirm(
          {
            ...values,
            confirmationCallback,
            shouldSignIn,
          },
          formikHelpers
        );
      }}
    >
      {({ handleSubmit, errors }) => (
        <>
          {showSentReconfirmationToast && !authErrorsState?.title && (
            <Alert
              type={ErrorStatus.SUCCESS}
              heading={t("signUpConfirmation.resendConfirmationCode.title")}
              onDismiss={() => {
                setShowSentReconfirmationToast(false);
              }}
              id="reconfirmationSuccess"
              dismissible
            >
              {t("signUpConfirmation.resendConfirmationCode.body")}
            </Alert>
          )}
          {authErrorsState?.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              heading={authErrorsState.title}
              onDismiss={authErrorsReset}
              id="cognitoErrors"
            >
              {authErrorsState.description}&nbsp;
              {authErrorsState.callToActionLink ? (
                <Link href={authErrorsState.callToActionLink}>
                  {authErrorsState.callToActionText}
                </Link>
              ) : undefined}
            </Alert>
          )}
          {Object.keys(errors).length > 0 && !authErrorsState.isError && (
            <Alert
              type={ErrorStatus.ERROR}
              validation={true}
              tabIndex={0}
              id="confirmationValidationErrors"
              heading={t("input-validation.heading", { ns: "common" })}
            >
              <ol className="gc-ordered-list">
                {Object.entries(errors).map(([fieldKey, fieldValue]) => {
                  return (
                    <ErrorListItem
                      key={`error-${fieldKey}`}
                      errorKey={fieldKey}
                      value={fieldValue}
                    />
                  );
                })}
              </ol>
            </Alert>
          )}
          <h1>{t("signUpConfirmation.title")}</h1>
          <p className="mb-10 -mt-6">
            {t("signUpConfirmation.emailHasBeenSent")}&nbsp;{username}
          </p>
          <form id="confirmation" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label
                id={"label-confirmationCode"}
                htmlFor="confirmationCode"
                className="required"
                required
              >
                {t("signUpConfirmation.fields.confirmationCode.label")}
              </Label>
              <TextInput
                className="h-10 w-36 rounded"
                type="text"
                id="confirmationCode"
                name="confirmationCode"
                required
              />
            </div>
            <Button className="gc-button--blue" type="submit">
              {t("signUpConfirmation.confirmButton")}
            </Button>
            <button
              type="button"
              className="block my-10 shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0"
              onClick={async () => {
                const error = await resendConfirmationCode(username);
                if (!error) {
                  setShowSentReconfirmationToast(true);
                }
              }}
            >
              {t("signUpConfirmation.resendConfirmationCodeButton")}
            </button>
          </form>
        </>
      )}
    </Formik>
  );
};
