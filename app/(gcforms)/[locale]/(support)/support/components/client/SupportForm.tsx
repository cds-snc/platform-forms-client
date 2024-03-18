"use client";
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
import { useState } from "react";
import { support } from "../../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@clientComponents/globals";

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validationSchemaSupport = Yup.object().shape({
    name: Yup.string().required(t("input-validation.required", { ns: "common" })),
    email: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .email(t("input-validation.email", { ns: "common" })),
    request: Yup.string().required(t("input-validation.required", { ns: "common" })),
    description: Yup.string().required(t("input-validation.required", { ns: "common" })),
  });

  return (
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
          await support({
            name,
            email,
            request,
            description,
            language: language,
          });
          setErrorMessage("");
          router.replace(`/${language}/support?success`);
        } catch (err) {
          logMessage.error(err);
          setErrorMessage(t("support.errors.submissionError"));
        } finally {
          setIsSubmitting(false);
        }
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchemaSupport}
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
              <h1>{t("support.title")}</h1>
              <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("support.useThisForm")}</p>
              <p className="mb-14">
                {t("support.gcFormsTeamPart1")}{" "}
                <Link href={`https://www.canada.ca/${language}/contact.html`}>
                  {t("support.gcFormsTeamLink")}
                </Link>{" "}
                {t("support.gcFormsTeamPart2")}
              </p>
              <Alert.Warning title={t("support.lookingForADemo")} role="note">
                <p>
                  {t("support.ifYouWouldLike")}{" "}
                  <Link href={`/${language}/contact`}>{t("support.contactUs")}</Link>.
                </p>
              </Alert.Warning>
              <form id="support" method="POST" onSubmit={handleSubmit} noValidate>
                <div className="focus-group mt-14">
                  <Label id={"label-name"} htmlFor={"name"} className="required" required>
                    {t("support.name")}
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
                  />
                </div>

                <Button type="submit" theme="primary" disabled={isSubmitting}>
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
