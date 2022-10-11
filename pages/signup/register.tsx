import React, { useState } from "react";
import { Formik } from "formik";
import { Button, TextInput, Label, Alert, ErrorListItem } from "@components/forms";
import { useAuth } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import * as Yup from "Yup";
import { isValidGovEmail, isUpperCase, isLowerCase, isNumber, isSymbol } from "@lib/validation";
import emailDomainList from "../../email.domains.json";

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const { t } = useTranslation(["signup", "common"]);

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" }))
      .test(
        "username-govEmail",
        t("signUpRegistration.fields.username.error.validGovEmail"),
        (value = "") => isValidGovEmail(value, emailDomainList.domains)
      ),
    firstName: Yup.string().required(t("input-validation.required", { ns: "common" })),
    lastName: Yup.string().required(t("input-validation.required", { ns: "common" })),
    password: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .min(8, t("signUpRegistration.fields.passwordConfirmation.error.minLength"))
      .max(50, t("signUpRegistration.fields.passwordConfirmation.error.maxLength"))
      .test(
        "password-valid-lowerCase",
        t("signUpRegistration.fields.passwordConfirmation.error.oneLowerCase"),
        (password = "") => isLowerCase(password)
      )
      .test(
        "password-valid-upperCase",
        t("signUpRegistration.fields.passwordConfirmation.error.oneUpperCase"),
        (password = "") => isUpperCase(password)
      )
      .test(
        "password-valid-number",
        t("signUpRegistration.fields.passwordConfirmation.error.oneNumber"),
        (password = "") => isNumber(password)
      )
      .test(
        "password-valid-symbol",
        t("signUpRegistration.fields.passwordConfirmation.error.oneSymbol"),
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
      initialValues={{ username: "", password: "", firstName: "", lastName: "" }}
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
                    Object.entries(errors).map(([elementId /*, errorMessage*/]) => {
                      return (
                        <ErrorListItem
                          errorKey={elementId}
                          value={t("input-validation.required", { ns: "common" })}
                          key={elementId}
                        />
                      );
                    })}
                </ol>
              </Alert>
            ) : null}
            <div className="focus-group">
              <Label id={"label-username"} htmlFor={"username"} className="required" required>
                {t("signUpRegistration.fields.username.label")}
              </Label>
              <TextInput type={"email"} id={"username"} name={"username"} />
            </div>
            <div className="focus-group">
              <Label id={"label-firstName"} htmlFor={"firstName"} className="required" required>
                {t("signUpRegistration.fields.firstName.label")}
              </Label>
              <TextInput type={"text"} id={"firstName"} name={"firstName"} />
            </div>
            <div className="focus-group">
              <Label id={"label-lastName"} htmlFor={"lastName"} className="required" required>
                {t("signUpRegistration.fields.lastName.label")}
              </Label>
              <TextInput type={"text"} id={"lastName"} name={"lastName"} />
            </div>
            <div className="focus-group">
              <Label id={"label-password"} htmlFor={"password"} className="required" required>
                {t("signUpRegistration.fields.password.label")}
              </Label>
              <TextInput type={"password"} id={"password"} name={"password"} />
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
