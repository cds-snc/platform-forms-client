"use client";
import { useTranslation } from "@i18n/client";
import { support, ErrorStates } from "../../actions";
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
import { useState } from "react";
import { email, minLength, object, safeParse, string, toLowerCase, toTrimmed } from "valibot";
import { Success } from "../../../components/client/Success";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [errors, setErrors] = useState<ErrorStates>({ validationErrors: [] });
  const [submitted, setSubmitted] = useState(false);

  const { getFlag } = useFeatureFlags();
  const apiFlag = getFlag(FeatureFlags.apiAccess);

  const getError = (fieldKey: string) => {
    return errors.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  const submitForm = async (formData: FormData) => {
    const formEntries = Object.fromEntries(formData.entries());

    const SupportSchema = object({
      name: string([minLength(1, t("input-validation.required"))]),
      email: string([
        toLowerCase(),
        toTrimmed(),
        minLength(1, t("input-validation.required")),
        email(t("input-validation.email")),
      ]),
      // radio input can send a non-string value when empty
      request: string(t("input-validation.required"), [
        minLength(1, t("input-validation.required")),
      ]),
      description: string([minLength(1, t("input-validation.required"))]),
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
    const result = await support(language, errors, formData);

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

          <h1>{t("support.title")}</h1>
          <p className="-mt-8 mb-6">
            {t("support.experience")}
            <Link href={`https://articles.alpha.canada.ca/forms-formulaires/${language}/guidance`}>
              {t("support.guidanceLink")}
            </Link>
            {t("support.useThisForm")}
          </p>
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
          <form id="support" action={submitForm} noValidate>
            {errors.error && (
              <Alert.Danger focussable={true} title={t("error")} className="my-2">
                <p>{t(errors.error)}</p>
              </Alert.Danger>
            )}

            <div className="gcds-input-wrapper mt-14">
              <Label id={"label-name"} htmlFor={"name"} className="required" required>
                {t("support.name")}
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
                {t("support.email")}
              </Label>
              <TextInput
                type="text"
                id="email"
                name="email"
                className="required w-[34rem]"
                error={getError("email")}
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
                  },
                  {
                    id: "request-technical",
                    name: "technical",
                    label: t("support.request.option2"),
                  },
                  ...(apiFlag
                    ? [
                        {
                          id: "request-technical-api",
                          name: "technical-api",
                          label: t("support.request.apiOption"),
                        },
                      ]
                    : []),

                  {
                    id: "request-form",
                    name: "form",
                    label: t("support.request.option3"),
                  },
                  {
                    id: "request-other",
                    name: "other",
                    label: t("support.request.option4"),
                  },
                ]}
                error={getError("request")}
              />
            </fieldset>
            <div className="gcds-textarea-wrapper">
              <Label id={"label-description"} htmlFor={"description"} className="required" required>
                {t("support.description.title")}
              </Label>
              <Description id={"description-description"}>
                {t("support.description.description")}
              </Description>
              <TextArea
                id="description"
                name="description"
                className="required mt-4 w-[34rem]"
                error={getError("description")}
              />
            </div>
            <SubmitButton>{t("submitButton", { ns: "common" })}</SubmitButton>
          </form>
        </>
      )}
    </>
  );
};
