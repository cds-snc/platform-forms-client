"use client";
import { useTranslation } from "@i18n/client";
import { contact, ErrorStates } from "../../actions";
import {
  Label,
  Alert as ValidationMessage,
  ErrorListItem,
  Description,
} from "@clientComponents/forms";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import Link from "next/link";
import { Alert } from "@clientComponents/globals";
import { TextInput } from "../../../components/client/TextInput";
import { MultipleChoiceGroup } from "../../../components/client/MultipleChoiceGroup";
import { TextArea } from "../../../components/client/TextArea";
import { SubmitButton } from "../../../components/client/SubmitButton";
import { email, minLength, object, safeParse, string, toLowerCase, toTrimmed } from "valibot";
import { useState } from "react";
import { Success } from "../../../components/client/Success";

export const ContactForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [errors, setErrors] = useState<ErrorStates>({ validationErrors: [] });
  const [submitted, setSubmitted] = useState(false);

  const getError = (fieldKey: string) => {
    return errors.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  const validate = async (formData: FormData) => {
    const formEntries = Object.fromEntries(formData.entries());

    const SupportSchema = object({
      // checkbox input can send a non-string value when empty
      request: string(t("input-validation.required", { ns: "common" }), [
        minLength(1, t("input-validation.required", { ns: "common" })),
      ]),
      description: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
      name: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
      email: string([
        toLowerCase(),
        toTrimmed(),
        minLength(1, t("input-validation.required", { ns: "common" })),
        email(t("input-validation.email", { ns: "common" })),
      ]),
      department: string([minLength(1, t("input-validation.required", { ns: "common" }))]),
      // Note: branch and jobTitle are not required/validated
      branch: string(),
      jobTitle: string(),
    });

    const validateForm = safeParse(SupportSchema, formEntries, { abortPipeEarly: true });

    if (!validateForm.success) {
      setErrors({
        validationErrors: validateForm.issues.map((issue) => ({
          fieldKey: issue.path?.[0].key as string,
          fieldValue: issue.message,
        })),
      });
      return;
    }

    // Submit the form
    const result = await contact(language, errors, formData);

    if (result.error) {
      setErrors({ ...result });
      return;
    }

    setSubmitted(true);
    return;
  };

  return (
    <>
      {submitted ? (
        <Success lang={language} />
      ) : (
        <>
          {Object.keys(errors.validationErrors).length > 0 && (
            <ValidationMessage
              type={ErrorStatus.ERROR}
              validation={true}
              tabIndex={0}
              id="validationErrors"
              heading={t("input-validation.heading", { ns: "common" })}
            >
              <ol className="gc-ordered-list">
                {Object.entries(errors.validationErrors).map(([, { fieldKey, fieldValue }]) => {
                  return (
                    <ErrorListItem
                      key={`error-${fieldKey}-${fieldValue}`}
                      errorKey={fieldKey}
                      value={fieldValue}
                    />
                  );
                })}
              </ol>
            </ValidationMessage>
          )}
          <h1>{t("contactus.title")}</h1>
          <p className="-mt-8 mb-6 text-[1.6rem]">{t("contactus.useThisForm")}</p>
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
          <form id="contactus" action={validate} noValidate>
            {errors.error && (
              <Alert.Danger focussable={true} title={t("error")} className="mb-2 mt-2">
                <p>{t(errors.error)}</p>
              </Alert.Danger>
            )}
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
                error={getError("request")}
              />
            </fieldset>
            <div className="gcds-textarea-wrapper">
              <Label id={"label-description"} htmlFor={"description"} className="required" required>
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
                error={getError("description")}
              />
            </div>
            <h3>{t("contactus.followUp")}</h3>
            <div className="gcds-input-wrapper">
              <Label id={"label-name"} htmlFor={"name"} className="required" required>
                {t("contactus.name")}
              </Label>
              <TextInput
                type={"text"}
                id={"name"}
                name={"name"}
                className="required w-[34rem]"
                error={getError("name")}
              />
            </div>
            <div className="gcds-input-wrapper">
              <Label id={"label-email"} htmlFor={"email"} className="required" required>
                {t("contactus.email")}
              </Label>
              <TextInput
                type={"text"}
                id={"email"}
                name={"email"}
                className="required w-[34rem]"
                required
                error={getError("email")}
              />
            </div>
            <div className="gcds-input-wrapper">
              <Label id="label-department" htmlFor="department" className="required" required>
                {t("contactus.department")}
              </Label>
              <TextInput
                type="text"
                id="department"
                name="department"
                className="required w-[34rem]"
                error={getError("department")}
              />
            </div>
            <div className="gcds-input-wrapper">
              <Label id={"label-branch"} htmlFor={"branch"}>
                {t("contactus.branch")}
              </Label>
              <TextInput
                type="text"
                id="branch"
                name="branch"
                className="w-[34rem]"
                error={getError("branch")}
              />
            </div>
            <div className="gcds-input-wrapper">
              <Label id={"label-jobTitle"} htmlFor={"jobTitle"}>
                {t("contactus.jobTitle")}
              </Label>
              <TextInput
                type={"text"}
                id={"jobTitle"}
                name={"jobTitle"}
                className="w-[34rem]"
                error={getError("jobTitle")}
              />
            </div>
            <SubmitButton>{t("submitButton", { ns: "common" })}</SubmitButton>
          </form>
        </>
      )}
    </>
  );
};
