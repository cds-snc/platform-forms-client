import React, { useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem, Description } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import * as Yup from "yup";
import { isValidGovEmail, isUpperCase, isLowerCase, isNumber, isSymbol } from "@lib/validation";
import emailDomainList from "../../email.domains.json";

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const { t } = useTranslation(["signup", "common"]);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "username-govEmail",
        t("signUpRegistration.fields.username.error.validGovEmail"),
        (value = "") => isValidGovEmail(value, emailDomainList.domains)
      ),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .min(8, t("signUpRegistration.fields.password.error.minLength"))
      .max(50, t("signUpRegistration.fields.password.error.maxLength"))
      .test(
        "password-valid-lowerCase",
        t("signUpRegistration.fields.password.error.oneLowerCase"),
        (password = "") => isLowerCase(password)
      )
      .test(
        "password-valid-upperCase",
        t("signUpRegistration.fields.password.error.oneUpperCase"),
        (password = "") => isUpperCase(password)
      )
      .test(
        "password-valid-number",
        t("signUpRegistration.fields.password.error.oneNumber"),
        (password = "") => isNumber(password)
      )
      .test(
        "password-valid-symbol",
        t("signUpRegistration.fields.password.error.oneSymbol"),
        (password = "") => isSymbol(password)
      ),
    passwordConfirmation: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .oneOf(
        [Yup.ref("password"), null],
        t("signUpRegistration.fields.passwordConfirmation.error.mustMatch")
      ),
  });

  if (username) {
    return <Confirmation username={username} />;
  }
  return (
    <Formik
      initialValues={{ username: "", password: "", name: "" }}
      onSubmit={async (values, formikHelpers) => {
        await register(values, formikHelpers, setUsername);
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, touched }) => (
        <>
          <h1>{t("signUpRegistration.title")}</h1>
          <form id="registration" method="POST" onSubmit={handleSubmit} noValidate>
            {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 ? (
              <Alert
                type="error"
                heading={t("input-validation.heading", { ns: "common" })}
                validation={true}
                id={"validationAlert"}
                tabIndex={0}
              >
                <ol className="gc-ordered-list">
                  {errors &&
                    Object.entries(errors).map(([elementId, errorMessage]) => {
                      return (
                        <ErrorListItem errorKey={elementId} value={errorMessage} key={elementId} />
                      );
                    })}
                </ol>
              </Alert>
            ) : null}
            <div className="focus-group">
              <Label id={"label-name"} htmlFor={"name"} className="required" required>
                {t("signUpRegistration.fields.name.label")}
              </Label>
              <TextInput type={"text"} id={"name"} name={"name"} />
            </div>
            <div className="focus-group">
              <Label id={"label-username"} htmlFor={"username"} className="required" required>
                {t("signUpRegistration.fields.username.label")}
              </Label>
              <Description id={"username-hint"}>
                {t("signUpRegistration.fields.username.hint")}
              </Description>
              <TextInput
                type={"email"}
                id={"username"}
                name={"username"}
                ariaDescribedBy={"desc-username-hint"}
              />
            </div>
            <div className="focus-group">
              <Label id={"label-password"} htmlFor={"password"} className="required" required>
                {t("signUpRegistration.fields.password.label")}
              </Label>
              <Description id={"password-hint"}>
                {t("signUpRegistration.fields.password.hint")}
              </Description>
              <TextInput
                type={"password"}
                id={"password"}
                name={"password"}
                ariaDescribedBy={"desc-username-hint"}
              />
            </div>
            <div className="focus-group">
              <Label
                id={"label-passwordConfirmation"}
                htmlFor={"passwordConfirmation"}
                className="required"
                required
              >
                {t("signUpRegistration.fields.passwordConfirmation.label")}
              </Label>
              <TextInput
                type={"password"}
                id={"passwordConfirmation"}
                name={"passwordConfirmation"}
              />
            </div>
            <div className="buttons">
              <Button type="submit">{t("submitButton", { ns: "common" })}</Button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "signup"]))),
    },
  };
};
