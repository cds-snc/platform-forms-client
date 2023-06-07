import React, { ReactElement, useState } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { TextInput, Label, Alert, Description } from "@components/forms";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import Link from "next/link";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { Button, StyledLink } from "@components/globals";
import { useVerify } from "@lib/hooks/auth";

interface VerifyProps {
  username: React.MutableRefObject<string>;
  authenticationFlowToken: React.MutableRefObject<string>;
}

export const Verify = ({ username, authenticationFlowToken }: VerifyProps): ReactElement => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["auth-verify", "cognito-errors", "common"]);
  const { verify, reVerify } = useVerify();
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();
  const [isReVerify, setIsReverify] = useState(false);

  // TODO - add error handling
  const handleReVerify = async () => {
    await reVerify({
      username: username.current,
      authenticationFlowToken: authenticationFlowToken.current,
    });
    setIsReverify(false);
  };

  const validationSchema = Yup.object().shape({
    verificationCode: Yup.string().required(t("verify.fields.confirmationCode.error.notEmpty")),
  });

  if (isReVerify) {
    return (
      <>
        <h1 className="border-0 mt-6 mb-6">{t("reVerify.title")}</h1>
        <p className="mt-10">{t("reVerify.description")}</p>
        <div className="flex mt-16">
          <Button theme="primary" className="mr-4" onClick={handleReVerify}>
            {t("reVerify.buttons.reSendCode")}
          </Button>
          <StyledLink theme="secondaryButton" href="/form-builder/support">
            {t("reVerify.buttons.getSupport")}
          </StyledLink>
        </div>
      </>
    );
  }

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
              search: "?referer=/signup/account-created",
            });
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        onReset={authErrorsReset}
      >
        {({ handleSubmit }) => (
          <>
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
            <h1 className="border-0 mt-6 mb-6">{t("verify.title")}</h1>
            <p className="mt-10 mb-12">{t("verify.emailHasBeenSent")}</p>
            <form id="verificationCodeForm" method="POST" onSubmit={handleSubmit} noValidate>
              <div className="focus-group">
                <Label
                  id={"label-verificationCode"}
                  htmlFor="verificationCode"
                  className="required"
                  required
                >
                  {t("verify.fields.confirmationCode.label")}
                </Label>
                <div className="text-p text-black-default mb-2" id={"verificationCode-hint"}>
                  {t("verify.fields.confirmationCode.description")}
                </div>
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
                {t("verify.confirmButton")}
              </Button>
              <div className="flex mt-12">
                <button
                  type="button"
                  className="block shadow-none bg-transparent text-blue-dark hover:text-blue-hover underline border-0 mr-8"
                  onClick={() => {
                    setIsReverify(true);
                  }}
                >
                  {t("verify.resendConfirmationCodeButton")}
                </button>
                <Link href={"/form-builder/support"}>{t("verify.help")}</Link>
              </div>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};
