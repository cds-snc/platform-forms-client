import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import React, { useState } from "react";
import Link from "next/link";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import {
  Button,
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  MultipleChoiceGroup,
} from "@components/forms";

export default function Support() {
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  // const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);

  // const handleRequest = async (name: string, email: string, request: string) => {
  //   // TODO send email
  // };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    request: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <div aria-live="polite">
      {!isSuccessScreen && (
        <Formik
          initialValues={{ name: "", email: "", request: "" }}
          onSubmit={async () => {
            setSubmitting(true);
            //todo
            // await handleRequest(name, email, request);
            setSubmitting(false);
            setIsSuccessScreen(true);
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, errors }) => (
            <>
              {/* {errorState.message && (
                <Alert
                  type="error"
                  validation={true}
                  tabIndex={0}
                  id="requestSubmissionError"
                  heading={t("input-validation.heading", { ns: "common" })}
                >
                  {errorState.message}
                </Alert>
              )} */}

              {Object.keys(errors).length > 0 && (
                <Alert
                  type="error"
                  validation={true}
                  tabIndex={0}
                  id="unlockPublishingValidationErrors"
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

              <h1>{t("support.title")}</h1>
              <p className="mb-14">
                {t("support.intro")}{" "}
                <Link href={`/${i18n.language}/form-builder/contactus`}>
                  {t("support.contactLink")}
                </Link>
                .
              </p>

              <form id="contactus" method="POST" onSubmit={handleSubmit} noValidate>
                <div className="focus-group">
                  <Label id={"label-name"} htmlFor={"name"} className="required" required>
                    {t("contactus.name")}
                  </Label>
                  <TextInput
                    type={"text"}
                    id={"name"}
                    name={"name"}
                    className="required w-[34rem]"
                  />
                </div>

                <div className="focus-group">
                  <Label id={"label-email"} htmlFor={"email"} className="required" required>
                    {t("contactus.email")}
                  </Label>
                  <TextInput
                    type={"text"}
                    id={"email"}
                    name={"email"}
                    className="required w-[34rem]"
                    required
                  />
                </div>

                <fieldset className="focus-group">
                  <legend className="gc-label required">
                    {t("support.request.title")}{" "}
                    <span data-testid="required" aria-hidden>
                      ({t("required")})
                    </span>
                  </legend>
                  <MultipleChoiceGroup
                    name="request"
                    type="radio"
                    choicesProps={[
                      {
                        id: "request-question",
                        name: "question",
                        label: t("support.request.option1"),
                        required: true,
                      },
                      {
                        id: "request-technical",
                        name: "feedback",
                        label: t("support.request.option2"),
                        required: true,
                      },
                      {
                        id: "request-other",
                        name: "demo",
                        label: t("support.request.option3"),
                        required: true,
                      },
                    ]}
                  ></MultipleChoiceGroup>
                </fieldset>

                <div className="flex mt-14">
                  <Button
                    type="submit"
                    className={` 
                        mr-8
                        bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                        hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5
                        focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
                      `}
                    disabled={submitting}
                  >
                    {t("submitButton", { ns: "common" })}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Formik>
      )}
      {isSuccessScreen && (
        <>
          <h1>Success</h1>
          <p className="mb-8">Thank you for you submission!</p>
          <p>
            We have received your request and someone from CDS will be in touch with you shortly.
          </p>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "form-builder"]))),
    },
  };
};
