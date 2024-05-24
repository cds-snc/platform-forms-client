"use client";
import { useTranslation } from "@i18n/client";
import { useFormState } from "react-dom";
import { contact } from "../../actions";
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

export const ContactForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [state, formAction] = useFormState(contact.bind(null, language), { validationErrors: [] });

  const getError = (fieldKey: string) => {
    return state.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

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
      <form id="contactus" action={formAction} noValidate>
        {state.error && (
          <Alert.Danger focussable={true} title={t("error")} className="mb-2 mt-2">
            <p>{t(state.error)}</p>
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
            className="required mt-4 w-[34rem]"
            required
            error={getError("description")}
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
            error={getError("name")}
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
            error={getError("email")}
          />
        </div>
        <div className="focus-group mt-14">
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
        <div className="focus-group mt-14">
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
        <div className="focus-group mt-14">
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
  );
};
