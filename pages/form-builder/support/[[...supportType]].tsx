import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import { getCsrfToken } from "next-auth/react";
import Head from "next/head";
import * as Yup from "yup";
import axios from "axios";
import { logMessage } from "@lib/logger";
import {
  TextInput,
  Label,
  Alert as ValidationMessage,
  ErrorListItem,
  MultipleChoiceGroup,
  TextArea,
  Description,
} from "@components/forms";
import { Button, LinkButton, Alert } from "@components/globals";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { useFocusIt } from "@lib/hooks/useFocusIt";

export default function Contactus() {
  const router = useRouter();
  const supportType = router.query.supportType === undefined ? "support" : "contactus";
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const headingSuccessRef = useRef(null);

  useFocusIt({ elRef: headingSuccessRef, dependencies: [isSuccessScreen] });

  const validationSchemaContactUs = Yup.object().shape({
    name: Yup.string().required(t("input-validation.required", { ns: "common" })),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    department: Yup.string().required(t("input-validation.required", { ns: "common" })),
    branch: Yup.string().required(t("input-validation.required", { ns: "common" })),
    jobTitle: Yup.string().required(t("input-validation.required", { ns: "common" })),
    request: Yup.array()
      .min(1)
      .of(Yup.string().required(t("input-validation.required", { ns: "common" }))),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  const contactUsForm = (
    <>
      <Head>
        <title>{t("contactus.title")}</title>
      </Head>
      <h1>{t("contactus.title")}</h1>
      <Formik
        initialValues={{
          name: "",
          email: "",
          department: "",
          branch: "",
          jobTitle: "",
          request: "",
          description: "",
        }}
        onSubmit={async ({ name, email, department, branch, jobTitle, request, description }) => {
          setIsSubmitting(true);
          try {
            const token: string = (await getCsrfToken()) || "";
            const response = await axios({
              url: "/api/request/support",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
              },
              data: {
                supportType,
                name,
                email,
                department,
                branch,
                jobTitle,
                request,
                description,
                language: i18n.language,
              },
              // If development mode disable timeout
              timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
            });
            setIsSubmitting(false);
            if (response?.status !== 200) {
              throw new Error(t("contactus.errors.submissionError"));
            }
            setErrorMessage("");
            setIsSuccessScreen(true);
          } catch (err) {
            logMessage.error(err);
            setIsSubmitting(false);
            setErrorMessage(t("contactus.errors.submissionError"));
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchemaContactUs}
      >
        {({ handleSubmit, errors }) => (
          <>
            {errorMessage && (
              <ValidationMessage
                type={ErrorStatus.ERROR}
                validation={true}
                tabIndex={0}
                id="requestSubmissionError"
                heading={t("input-validation.heading", { ns: "common" })}
              >
                {errorMessage}
              </ValidationMessage>
            )}

            {Object.keys(errors).length > 0 && (
              <ValidationMessage
                type={ErrorStatus.ERROR}
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
              </ValidationMessage>
            )}
            <form id="contactus" method="POST" onSubmit={handleSubmit} noValidate>
              <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("contactus.useThisForm")}</p>
              <p className="mb-14">
                {t("contactus.gcFormsTeamPart1")}{" "}
                <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
                  {t("contactus.gcFormsTeamLink")}
                </Link>{" "}
                {t("contactus.gcFormsTeamPart2")}
              </p>
              <Alert.Warning title={t("contactus.needSupport")} role="note">
                <p>
                  {t("contactus.ifYouExperience")}{" "}
                  <Link href={`/form-builder/support`}>{t("contactus.supportFormLink")}</Link>.
                </p>
              </Alert.Warning>
              <div className="focus-group mt-14">
                <Label id={"label-name"} htmlFor={"name"} className="required" required>
                  {t("contactus.name")}
                </Label>
                <TextInput type={"text"} id={"name"} name={"name"} className="required w-[34rem]" />
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
              <div className="focus-group mt-14">
                <Label id={"label-department"} htmlFor={"department"} className="required" required>
                  {t("contactus.department")}
                </Label>
                <TextInput
                  type={"text"}
                  id={"department"}
                  name={"department"}
                  className="required w-[34rem]"
                />
              </div>
              <div className="focus-group mt-14">
                <Label id={"label-branch"} htmlFor={"branch"} className="required" required>
                  {t("contactus.branch")}
                </Label>
                <TextInput
                  type={"text"}
                  id={"branch"}
                  name={"branch"}
                  className="required w-[34rem]"
                />
              </div>
              <div className="focus-group mt-14">
                <Label id={"label-jobTitle"} htmlFor={"jobTitle"} className="required" required>
                  {t("contactus.jobTitle")}
                </Label>
                <TextInput
                  type={"text"}
                  id={"jobTitle"}
                  name={"jobTitle"}
                  className="required w-[34rem]"
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
                  type="checkbox"
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

              <Button type="submit" className="gc-button--blue" disabled={isSubmitting}>
                {t("submitButton", { ns: "common" })}
              </Button>
            </form>
          </>
        )}
      </Formik>
    </>
  );

  const validationSchemaSupport = Yup.object().shape({
    name: Yup.string().required(t("input-validation.required", { ns: "common" })),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    request: Yup.string().required(t("input-validation.required", { ns: "common" })),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  const supportForm = (
    <>
      <Head>
        <title>{t("support.title")}</title>
      </Head>
      <h1>{t("support.title")}</h1>
      <Formik
        initialValues={{
          name: "",
          email: "",
          request: "",
          description: "",
        }}
        onSubmit={async ({ name, email, request, description }) => {
          setIsSubmitting(true);
          try {
            const token: string = (await getCsrfToken()) || "";
            const response = await axios({
              url: "/api/request/support",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
              },
              data: { supportType, name, email, request, description },
              // If development mode disable timeout
              timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
            });
            setIsSubmitting(false);
            if (response?.status !== 200) {
              throw new Error(t("support.errors.submissionError"));
            }
            setErrorMessage("");
            setIsSuccessScreen(true);
          } catch (err) {
            logMessage.error(err);
            setIsSubmitting(false);
            setErrorMessage(t("support.errors.submissionError"));
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchemaSupport}
      >
        {({ handleSubmit, errors }) => (
          <>
            {errorMessage && (
              <ValidationMessage
                type={ErrorStatus.ERROR}
                validation={true}
                tabIndex={0}
                id="requestSubmissionError"
                heading={t("input-validation.heading", { ns: "common" })}
              >
                {errorMessage}
              </ValidationMessage>
            )}

            {Object.keys(errors).length > 0 && (
              <ValidationMessage
                type={ErrorStatus.ERROR}
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
              </ValidationMessage>
            )}
            <form id="support" method="POST" onSubmit={handleSubmit} noValidate>
              <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("support.useThisForm")}</p>
              <p className="mb-14">
                {t("support.gcFormsTeamPart1")}{" "}
                <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
                  {t("support.gcFormsTeamLink")}
                </Link>{" "}
                {t("support.gcFormsTeamPart2")}
              </p>
              <Alert.Warning title={t("support.lookingForADemo")} role="note">
                <p>
                  {t("support.ifYouWouldLike")}{" "}
                  <Link href={`/form-builder/support/contactus`}>{t("support.contactUs")}</Link>.
                </p>
              </Alert.Warning>
              <div className="focus-group mt-14">
                <Label id={"label-name"} htmlFor={"name"} className="required" required>
                  {t("support.name")}
                </Label>
                <TextInput type={"text"} id={"name"} name={"name"} className="required w-[34rem]" />
              </div>
              <div className="focus-group">
                <Label id={"label-email"} htmlFor={"email"} className="required" required>
                  {t("support.email")}
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
                    ({t("required", { ns: "common" })})
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
                      name: "technical",
                      label: t("support.request.option2"),
                      required: true,
                    },
                    {
                      id: "request-form",
                      name: "form",
                      label: t("support.request.option3"),
                      required: true,
                    },
                    {
                      id: "request-other",
                      name: "other",
                      label: t("support.request.option4"),
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
                  {t("support.description.title")}
                </Label>
                <Description id={"description-description"}>
                  {t("support.description.description")}
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

              <Button type="submit" theme="primary" disabled={isSubmitting}>
                {t("submitButton", { ns: "common" })}
              </Button>
            </form>
          </>
        )}
      </Formik>
    </>
  );

  return (
    <>
      {!isSuccessScreen && (supportType === "contactus" ? contactUsForm : supportForm)}

      {isSuccessScreen && (
        <>
          <h1 ref={headingSuccessRef}>{t("requestSuccess.title")}</h1>
          <p className="mb-16 mt-[-2rem] font-bold">{t("requestSuccess.weWillRespond")}</p>
          <div className="mb-16">
            <LinkButton.Primary href={`/myforms`}>
              {t("requestSuccess.backToForms")}
            </LinkButton.Primary>
          </div>
          <p className="mb-8">
            {t("requestSuccess.forOtherEnquiriesPart1")}{" "}
            <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
              {t("requestSuccess.forOtherEnquiriesLink")}
            </Link>{" "}
            {t("requestSuccess.forOtherEnquiriesPart2")}.
          </p>
          <p>{t("requestSuccess.theGCFormsTeam")}</p>
        </>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // For any URLs other than /support and /support/contactus, redirect the user to the 404 page
  if (
    context.query?.supportType !== undefined &&
    String(context.query.supportType) !== "contactus"
  ) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "form-builder"]))),
    },
  };
};
