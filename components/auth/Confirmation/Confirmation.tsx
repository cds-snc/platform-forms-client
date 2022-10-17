import React, { ReactElement, useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";

export interface ConfirmationProps {
  /**
   * The email of the user being confirmed.
   */
  username: string;
}

export const Confirmation = ({ username }: ConfirmationProps): ReactElement => {
  const { cognitoError, setCognitoError, confirm, resendConfirmationCode } = useAuth();
  const [showSentReconfirmationToast, setShowSentReconfirmationToast] = useState(false);
  const { t } = useTranslation(["signup", "cognito-errors", "common"]);

  const validationSchema = Yup.object().shape({
    confirmationCode: Yup.number()
      .typeError(t("signUpConfirmation.fields.confirmationCode.error.number"))
      .required(t("input-validation.required", { ns: "common" })),
  });
  if (!username) {
    return <p>{t("signUpConfirmation.noUsername")}</p>;
  }
  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{ username: username, confirmationCode: "" }}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        await setShowSentReconfirmationToast(false);
        await confirm(values, formikHelpers);
      }}
    >
      {({ handleSubmit, errors }) => (
        <>
          {showSentReconfirmationToast && !cognitoError && (
            <Alert
              type="success"
              heading={t("signupConfirmation.resendConfirmationCode.success.title")}
              onDismiss={() => {
                setShowSentReconfirmationToast(false);
              }}
              id="reconfirmationSuccess"
              dismissible
            >
              {t("signupConfirmation.resendConfirmationCode.success.body")}
            </Alert>
          )}
          {cognitoError && (
            <Alert
              type="error"
              heading={cognitoError}
              onDismiss={() => {
                setCognitoError("");
              }}
              id="cognitoErrors"
              dismissible
            />
          )}
          {Object.keys(errors).length > 0 && !cognitoError && (
            <Alert
              type="error"
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
          <form id="confirmation" method="POST" onSubmit={handleSubmit} noValidate>
            <div className="focus-group">
              <Label id={"label-confirmationCode"} htmlFor="confirmationCode" className="required">
                {t("signUpConfirmation.fields.confirmationCode.label")}
              </Label>
              <TextInput type="text" id="confirmationCode" name="confirmationCode" />
            </div>
            <div className="buttons">
              <Button
                type="button"
                onClick={async () => {
                  const error = await resendConfirmationCode(username);
                  if (!error) {
                    await setShowSentReconfirmationToast(true);
                  }
                }}
                secondary
              >
                {t("signUpConfirmation.resendConfirmationCodeButton")}
              </Button>
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};
