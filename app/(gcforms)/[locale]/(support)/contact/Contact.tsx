"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Formik } from "formik";
import { useTranslation } from "@i18n/client";

import { getCsrfToken } from "@lib/client/csrfToken";
import * as Yup from "yup";
import axios from "axios";
import { logMessage } from "@lib/logger";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import {
  TextInput,
  Label,
  Alert as ValidationMessage,
  ErrorListItem,
  MultipleChoiceGroup,
  TextArea,
  Description,
} from "@clientComponents/forms";
import { Button, LinkButton, Alert } from "@clientComponents/globals";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { useFocusIt } from "@lib/hooks/useFocusIt";

export function Contact() {
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
    request: Yup.array()
      .min(1)
      .of(Yup.string().required(t("input-validation.required", { ns: "common" }))),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
    <>
      {!isSuccessScreen && (
        <>
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
            onSubmit={async ({
              name,
              email,
              department,
              branch,
              jobTitle,
              request,
              description,
            }) => {
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
                    supportType: "contactus",
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
                  <ErrorPanel supportLink={false}>{t("server-error", { ns: "common" })}</ErrorPanel>
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
                {!errorMessage && (
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
                        <Link href={`/support`}>{t("contactus.supportFormLink")}</Link>.
                      </p>
                    </Alert.Warning>
                    <fieldset className="focus-group mt-14">
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
                            id: "request-feature",
                            name: "feature",
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
                        className="required mt-4 w-[34rem]"
                        required
                      />
                    </div>
                    <p className="mt-14 text-[1.6rem]">{t("contactus.followUp")}</p>
                    <div className="focus-group mt-14">
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
                    <div className="focus-group mt-14">
                      <Label
                        id={"label-department"}
                        htmlFor={"department"}
                        className="required"
                        required
                      >
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
                      <Label id={"label-branch"} htmlFor={"branch"}>
                        {t("contactus.branch")}
                      </Label>
                      <TextInput
                        type={"text"}
                        id={"branch"}
                        name={"branch"}
                        className="w-[34rem]"
                      />
                    </div>
                    <div className="focus-group mt-14">
                      <Label id={"label-jobTitle"} htmlFor={"jobTitle"}>
                        {t("contactus.jobTitle")}
                      </Label>
                      <TextInput
                        type={"text"}
                        id={"jobTitle"}
                        name={"jobTitle"}
                        className="w-[34rem]"
                      />
                    </div>
                    <Button type="submit" className="gc-button--blue" disabled={isSubmitting}>
                      {t("submitButton", { ns: "common" })}
                    </Button>
                  </form>
                )}
              </>
            )}
          </Formik>
        </>
      )}

      {isSuccessScreen && (
        <>
          <h1 ref={headingSuccessRef}>{t("requestSuccess.title")}</h1>
          <p className="mb-16 mt-[-2rem] font-bold">{t("requestSuccess.weWillRespond")}</p>
          <div className="mb-16">
            <LinkButton.Primary href={`${i18n.language}/forms`}>
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
