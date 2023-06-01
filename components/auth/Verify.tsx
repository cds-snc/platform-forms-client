import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { TextInput, Label, Alert, Description } from "@components/forms";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { Button } from "@components/globals";
import { useVerify } from "@lib/hooks/auth";

// TODO:
// To replace Confirmation component

interface VerifyProps {
  username: React.MutableRefObject<string>;
  authenticationFlowToken: React.MutableRefObject<string>;
}

export const Verify = ({ username, authenticationFlowToken }: VerifyProps): ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["signup", "cognito-errors", "common"]);
  const { verify } = useVerify();
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const validationSchema = Yup.object().shape({
    verificationCode: Yup.string()
      .required(t("signUpConfirmation.fields.confirmationCode.error.notEmpty"))
      .matches(/^[0-9a-z]{5}?$/i, t("signUpConfirmation.fields.confirmationCode.error.length")),
  });

  return (
    <>
      <Formik
        initialValues={{ verificationCode: "" }}
        onSubmit={async ({ verificationCode }) => {
          const data = await verify({
            username: username.current,
            authenticationFlowToken: authenticationFlowToken.current,
            verificationCode,
          });

          if (data && !data?.ok) {
            const error = data?.error;
            if (error) {
              handleErrorById(error);
            }
          }

          if (data) {
            router.push({
              pathname: `/${i18n.language}/auth/policy`,
            });
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        onReset={authErrorsReset}
      >
        {({ handleSubmit /*, errors*/ }) => (
          <>
            {/* {showSentReconfirmationToast && !authErrorsState?.title && (
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
          )} */}
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
            <h1 className="border-0">{t("signUpConfirmation.title")}</h1>
            <p className="mb-10 -mt-6">{t("signUpConfirmation.emailHasBeenSent")}</p>
            <form id="verificationCode" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label
                  id={"label-verificationCode"}
                  htmlFor="verificationCode"
                  className="required"
                  required
                >
                  {t("signUpConfirmation.fields.confirmationCode.label")}
                </Label>
                <Description className="text-p text-black-default" id={"verificationCode-hint"}>
                  {t("signUpConfirmation.fields.confirmationCode.description")}
                </Description>
                <TextInput
                  className="h-10 w-36 rounded"
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  ariaDescribedBy="verificationCode-hint"
                  required
                />
              </div>
              <Button theme="primary" type="submit">
                {t("signUpConfirmation.confirmButton")}
              </Button>
              <div className="flex mt-10">
                <button
                  type="button"
                  className="block shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0 mr-8"
                  onClick={async () => {
                    // TODO - New Verification Code
                    // const error = await resendConfirmationCode(username.current);
                    // if (!error) {
                    //   setShowSentReconfirmationToast(true);
                    // }
                  }}
                >
                  {t("signUpConfirmation.resendConfirmationCodeButton")}
                </button>
                <Link href={"/form-builder/support"}>{t("signUpConfirmation.help")}</Link>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
