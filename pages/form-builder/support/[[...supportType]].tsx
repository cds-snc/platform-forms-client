import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik } from "formik";
import { useTranslation } from "next-i18next";
import { getCsrfToken } from "next-auth/react";
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
import { Attention } from "@components/globals/Attention/Attention";
import { checkOne } from "@lib/cache/flags";

export default function Contactus() {
  const router = useRouter();
  const supportType = router.query.supportType === undefined ? "support" : "contactus";
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequest = async (
    name: string,
    email: string,
    request: string,
    description: string
  ) => {
    const token: string = (await getCsrfToken()) || "";
    return await axios({
      url: "/api/request/support",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      data: { supportType, name, email, request, description },
      // If development mode disable timeout
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    }).catch((err) => {
      logMessage.error(err);
      setErrorMessage(t("submissionError"));
    });
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("input-validation.required", { ns: "common" })),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    request: Yup.string().required(t("input-validation.required", { ns: "common" })),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  // Chooses content based on supportType. This allows both the Support and Contactus pages to be
  // combined in this file, along with he confirmation page. If the form structure changes then
  // this file should be separated into three files: support, contactus, confirmation.
  let content: React.ReactNode = null;
  if (supportType === "contactus") {
    content = (
      <>
        <h1>{t("contactus.title")}</h1>
        <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("contactus.useThisForm")}</p>
        <p className="mb-14">
          {t("contactus.gcFormsTeamPart1")}&nbsp;
          <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
            {t("contactus.gcFormsTeamLink")}
          </Link>
          &nbsp;{t("contactus.gcFormsTeamPart2")}
        </p>
        <Attention type="warning" heading={t("contactus.needSupport")}>
          {t("contactus.ifYouExperience")}&nbsp;
          <Link href={`/form-builder/support`}>{t("contactus.supportFormLink")}</Link>.
        </Attention>
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
          <Label id={"label-description"} htmlFor={"description"} className="required" required>
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
      </>
    );
  } else {
    content = (
      <>
        <h1>{t("support.title")}</h1>
        <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("support.useThisForm")}</p>
        <p className="mb-14">
          {t("support.gcFormsTeamPart1")}&nbsp;
          <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
            {t("support.gcFormsTeamLink")}
          </Link>
          &nbsp;{t("support.gcFormsTeamPart2")}
        </p>
        <Attention type="warning" heading={t("support.lookingForADemo")}>
          {t("support.ifYouWouldLike")}&nbsp;
          <Link href={`/form-builder/support/contactus`}>{t("support.contactUs")}</Link>.
        </Attention>
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
          <Label id={"label-description"} htmlFor={"description"} className="required" required>
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
      </>
    );
  }

  return (
    <div aria-live="polite">
      {!isSuccessScreen && (
        <Formik
          initialValues={{ name: "", email: "", request: "", description: "" }}
          onSubmit={async ({ name, email, request, description }) => {
            setIsSubmitting(true);
            try {
              const response = await handleRequest(name, email, request, description);
              setIsSubmitting(false);
              if (response?.status !== 200) {
                throw new Error(t("submissionError"));
              }
              setErrorMessage("");
              setIsSuccessScreen(true);
            } catch (err) {
              logMessage.error(err);
              setIsSubmitting(false);
              setErrorMessage(t("submissionError"));
            }
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, errors }) => (
            <>
              {errorMessage && (
                <Alert
                  type="error"
                  validation={true}
                  tabIndex={0}
                  id="requestSubmissionError"
                  heading={t("input-validation.heading", { ns: "common" })}
                >
                  {errorMessage}
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
              <form id="contactus" method="POST" onSubmit={handleSubmit} noValidate>
                {content}

                <Button type="submit" className="gc-button--blue" disabled={isSubmitting}>
                  {t("submitButton", { ns: "common" })}
                </Button>
              </form>
            </>
          )}
        </Formik>
      )}
      {isSuccessScreen && (
        <>
          <h1>{t("requestSuccess.title")}</h1>
          <p className="mb-16 mt-[-2rem] font-bold">{t("requestSuccess.weWillRespond")}</p>
          <div className="mb-16">
            <StyledLink href={`/myforms`} className="gc-button--blue">
              {t("requestSuccess.backToForms")}
            </StyledLink>
          </div>
          <p className="mb-8">
            {t("requestSuccess.forOtherEnquiriesPart1")}&nbsp;
            <Link href={`https://www.canada.ca/${i18n.language}/contact.html`}>
              {t("requestSuccess.forOtherEnquiriesLink")}
            </Link>
            &nbsp;{t("requestSuccess.forOtherEnquiriesPart2")}.
          </p>
          <p>{t("requestSuccess.theGCFormsTeam")}</p>
        </>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supportFormsEnabled = await checkOne("supportForms");
  if (!supportFormsEnabled) {
    return {
      redirect: {
        destination: `/${context.locale}/myforms`,
        permanent: false,
      },
    };
  }
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
