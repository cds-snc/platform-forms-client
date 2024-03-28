"use client";
import { useTranslation } from "@i18n/client";
import { useFormState } from "react-dom";
import { unlockPublishing } from "../../actions";
import { Label, Alert, ErrorListItem, Description } from "@clientComponents/forms";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { TextInput } from "../../../components/client/TextInput";
import { TextArea } from "../../../components/client/TextArea";
import { SubmitButton } from "../../../components/client/SubmitButton";

export const UnlockPublishingForm = ({ userEmail }: { userEmail: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("unlock-publishing");

  const [state, formAction] = useFormState(unlockPublishing.bind(null, language, userEmail), {
    validationErrors: [],
  });

  const getError = (fieldKey: string) => {
    return state.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  return (
    <>
      {Object.keys(state.validationErrors).length > 0 && (
        <Alert
          type={ErrorStatus.ERROR}
          validation={true}
          tabIndex={0}
          id="unlockPublishingValidationErrors"
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
        </Alert>
      )}

      <h1>{t("unlockPublishing.title")}</h1>
      <p className="mb-14">{t("unlockPublishing.paragraph1")}</p>
      <form id="unlock-publishing" action={formAction} noValidate>
        <div className="focus-group">
          <Label id="label-managerEmail" htmlFor="managerEmail" className="required" required>
            {t("unlockPublishing.form.field1.title")}
          </Label>
          <Description id={"unlock-publishing-description"}>
            {t("unlockPublishing.form.field1.description")}
          </Description>
          <TextInput
            type="text"
            id="managerEmail"
            name="managerEmail"
            className="required w-[34rem]"
            ariaDescribedBy="unlock-publishing-description"
            error={getError("managerEmail")}
          />
        </div>
        <div className="focus-group">
          <Label id="label-department" htmlFor="department" className="required" required>
            {t("unlockPublishing.form.field2.title")}
          </Label>
          <TextInput
            type="text"
            id="department"
            name="department"
            className="required w-[34rem]"
            required
            error={getError("department")}
          />
        </div>
        <div className="focus-group">
          <Label id={"label-goals"} htmlFor={"goals"} className="required" required>
            {t("unlockPublishing.form.field3.title")}
          </Label>
          <TextArea
            id="goals"
            name="goals"
            className="required mt-4 w-[34rem]"
            required
            error={getError("goals")}
          />
        </div>
        <div className="mt-14 flex gap-4">
          <SubmitButton>{t("submitButton", { ns: "common" })}</SubmitButton>
          <LinkButton.Secondary href={`/${language}/forms/`}>
            {t("unlockPublishing.skipStepButton")}
          </LinkButton.Secondary>
        </div>
      </form>
    </>
  );
};
