"use client";
import { useTranslation } from "@i18n/client";
import { useFormState } from "react-dom";
import { support } from "../../actions";
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

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [state, formAction] = useFormState(support.bind(null, language), { validationErrors: [] });

  const getError = (fieldKey: string) => {
    return state.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  return (
    <>
      {Object.keys(state.validationErrors).length > 0 && (
        <ValidationMessage
          type={ErrorStatus.ERROR}
          validation={true}
          tabIndex={0}
          id="validationErrors"
          heading={t("input-validation.heading", { ns: "common" })}
        >
          <ol className="gc-ordered-list">
            {Object.entries(state.validationErrors).map(([, { fieldKey, fieldValue }]) => {
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
      <form id="support" action={formAction} noValidate>
        <div className="focus-group mt-14">
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
        <div className="focus-group">
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
        <div className="focus-group">
          <Label id={"label-description"} htmlFor={"description"} className="required" required>
            {t("support.description.title")}
          </Label>
          <Description id={"description-description"}>
            {t("support.description.description")}
          </Description>
          <TextArea
            id="description"
            name="description"
            className="required w-[34rem] mt-4"
            error={getError("description")}
          />
        </div>
        <SubmitButton>{t("submitButton", { ns: "common" })}</SubmitButton>
      </form>
    </>
  );
};
