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
import { redirect } from "next/navigation";

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [state, formAction] = useFormState(support.bind(null, language), { validationErrors: [] });

  const getError = (fieldKey: string) => {
    return state.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  if (state.error === "") {
    //Route through the client.
    redirect(`/${language}/support?success`);
  }

  return (
    <>
      {/* @todo  Add general error to show user there was an internal service error */}
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
      <p className="-mt-8 mb-6 text-[1.6rem]">
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
      <form id="support" action={formAction} noValidate>
        {state.error && (
          <Alert.Danger focussable={true} title={t("error")} className="mb-2 mt-2">
            <p>{t(state.error)}</p>
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
  );
};
