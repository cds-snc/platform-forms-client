"use client";
import { useState } from "react";
import { Formik } from "formik";
import { useTranslation } from "@i18n/client";
import * as Yup from "yup";
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
import { Button } from "@clientComponents/globals";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { useRouter } from "next/navigation";
import { contact } from "../../actions";
import { Alert } from "@clientComponents/globals";
import Link from "next/link";

export const ContactForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
          await contact({
            name,
            email,
            department,
            branch,
            jobTitle,
            request,
            description,
          });
          setErrorMessage("");
          router.replace(`/${language}/contact?success`);
        } catch (err) {
          logMessage.error(err);
          setErrorMessage(t("contactus.errors.submissionError"));
        } finally {
          setIsSubmitting(false);
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
            <>
              <h1>{t("contactus.title")}</h1>
              <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("contactus.useThisForm")}</p>
              <p className="mb-14">
                {t("contactus.gcFormsTeamPart1")}{" "}
                <Link href={`https://www.canada.ca/${language}/contact.html`}>
                  {t("contactus.gcFormsTeamLink")}
                </Link>{" "}
                {t("contactus.gcFormsTeamPart2")}
              </p>
              <Alert.Warning title={t("contactus.needSupport")} role="note">
                <p>
                  {t("contactus.ifYouExperience")}{" "}
                  <Link href={`/${language}/support`}>{t("contactus.supportFormLink")}</Link>.
                </p>
              </Alert.Warning>
              <form id="contactus" method="POST" onSubmit={handleSubmit} noValidate>
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
                  <TextInput type={"text"} id={"branch"} name={"branch"} className="w-[34rem]" />
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
            </>
          )}
        </>
      )}
    </Formik>
  );
};
