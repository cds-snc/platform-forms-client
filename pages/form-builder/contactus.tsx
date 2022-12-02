import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import React, { useState } from "react";
import Link from "next/link";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import axios from "axios";
import { logMessage } from "@lib/logger";
import {
  Button,
  TextInput,
  Label,
  Alert,
  ErrorListItem,
  MultipleChoiceGroup,
  TextArea,
  Description,
} from "@components/forms";
import { StyledLink } from "@components/globals/StyledLink/StyledLink";

export default function Contactus() {
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  const [errorState, setErrorState] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);

  const handleRequest = async (
    name: string,
    email: string,
    request: string,
    description: string
  ) => {
    return await axios({
      url: "/api/request/contactus",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { name, email, request, description },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    }).catch((err) => {
      logMessage.error(err);
      setErrorState({ message: t("submissionError") });
    });
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .max(50, t("signUpRegistration.fields.name.error.maxLength")),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    request: Yup.string().required(t("input-validation.required", { ns: "common" })),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <div aria-live="polite">
      {!isSuccessScreen && (
        <Formik
          initialValues={{ name: "", email: "", request: "", description: "" }}
          onSubmit={async ({ name, email, request, description }) => {
            setSubmitting(true);
            try {
              const response = await handleRequest(name, email, request, description);
              setSubmitting(false);
              if (response?.status !== 200) {
                throw new Error(t("submissionError"));
              }
              setErrorState({ message: "" });
              setIsSuccessScreen(true);
            } catch (err) {
              logMessage.error(err);
              setSubmitting(false);
              setErrorState({ message: t("submissionError") });
            }
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, errors }) => (
            <>
              {errorState.message && (
                <Alert
                  type="error"
                  validation={true}
                  tabIndex={0}
                  id="requestSubmissionError"
                  heading={t("input-validation.heading", { ns: "common" })}
                >
                  {errorState.message}
                </Alert>
              )}

              {Object.keys(errors).length > 0 && (
                <Alert
                  type="error"
                  validation={true}
                  tabIndex={0}
                  id="validationErrors"
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

              <h1>{t("contactus.title")}</h1>
              <p className="mb-6 mt-[-2rem]">
                {t("contactus.paragraph1")}&nbsp;
                <Link href={`/${i18n.language}/form-builder/support`}>
                  {t("contactus.paragraph1Link")}
                </Link>
                .
              </p>
              <p className="mb-6">
                {t("contactus.paragraph2")}&nbsp;
                <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
                  {t("contactus.paragraph2Link")}
                </Link>
                &nbsp;{t("contactus.paragraph2Part2")}
              </p>
              <p className="mb-20">{t("contactus.paragraph3")}</p>
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
                    {t("contactus.request.title")}{" "}
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
                        label: t("contactus.request.option1"),
                        required: true,
                      },
                      {
                        id: "request-feedback",
                        name: "feedback",
                        label: t("contactus.request.option2"),
                        required: true,
                      },
                      {
                        id: "request-demo",
                        name: "demo",
                        label: t("contactus.request.option3"),
                        required: true,
                      },
                      {
                        id: "request-other",
                        name: "other",
                        label: t("contactus.request.option4"),
                        required: true,
                      },
                    ]}
                  ></MultipleChoiceGroup>
                </fieldset>
                <div className="focus-group">
                  <Label
                    id={"label-description"}
                    htmlFor={"description"}
                    className="required"
                    required
                  >
                    {t("contactus.description.title")}
                  </Label>
                  <Description id={"description-description"}>
                    {t("contactus.description.description")}
                  </Description>
                  <TextArea
                    id={"description"}
                    name={"description"}
                    className="required w-[34rem] mt-4"
                    required
                    characterCountMessages={{
                      part1: t("formElements.characterCount.part1"),
                      part2: t("formElements.characterCount.part2"),
                      part1Error: t("formElements.characterCount.part1-error"),
                      part2Error: t("formElements.characterCount.part2-error"),
                    }}
                  />
                </div>
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
          <h1>{t("requestSuccess.title")}</h1>
          <p className="mb-16 mt-[-2rem] font-bold">{t("requestSuccess.paragraph1")}</p>
          <div className="mb-16">
            <StyledLink
              href={`/${i18n.language}/myforms`}
              className={`
                bg-blue-dark text-white-default border-black-default py-4 px-8 rounded-lg border-2 border-solid
                hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active active:top-0.5 
                visited:text-white-default visited:hover:text-white-default focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500
              `}
            >
              {t("support.backToForms")}
            </StyledLink>
          </div>
          <p className="mb-8">
            {t("requestSuccess.paragraph2Part1")}&nbsp;
            <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
              {t("requestSuccess.paragraph2Link")}
            </Link>
            &nbsp;{t("requestSuccess.paragraph2Part2")}.
          </p>
          <p>{t("requestSuccess.paragraph3")}</p>
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
