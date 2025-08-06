"use client";
import { useTranslation } from "@i18n/client";
import { support, ErrorStates } from "../../actions";
import {
  Label,
  Alert as ValidationMessage,
  ErrorListItem,
  Description,
  // TextInput,
  // MultipleChoiceGroup
} from "@clientComponents/forms";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import Link from "next/link";
import { Alert } from "@clientComponents/globals";
// import { TextInput } from "../../../components/client/TextInput";
// import { MultipleChoiceGroup } from "../../../components/client/MultipleChoiceGroup";
// import { TextArea } from "../../../components/client/TextArea";
import { SubmitButton } from "../../../components/client/SubmitButton";
import { useActionState, useState } from "react";
// import { email, minLength, object, safeParse, string, toLowerCase, trim, pipe } from "valibot";
import { Success } from "../../../components/client/Success";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";

import { TextInputElement } from "@root/components/clientComponents/forms/TextInput/TextInputElement";
import { MultipleChoiceGroupElement } from "@root/components/clientComponents/forms/MultipleChoiceGroup/MultipleChoiceGroupElement";
// import { RegularTextInput } from "@root/components/clientComponents/forms/TextInput/RegularTextInput";

type FormState = {
  formData: {
    name: string;
    email: string;
    request: string;
    description: string;
  };
};

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const [errors, setErrors] = useState<ErrorStates>({ validationErrors: [] });
  const [submitted, setSubmitted] = useState(false);

  const getError = (fieldKey: string) => {
    // return errors.validationErrors.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
    return state.validationErrors?.find((e) => e.fieldKey === fieldKey)?.fieldValue || "";
  };

  const localFormAction = async (_: FormState, formData: FormData) => {
    const formEntries = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      request: (formData.get("request") as string) || "",
      description: (formData.get("description") as string) || "",
    };

    const result = await support(language, errors, formData);

    // Failed
    if (result.error || result.validationErrors.length > 0) {
      setErrors({ ...result });
      return {
        ...result,
        formData: formEntries,
      };
    }

    // Success
    setSubmitted(true);
    return {
      ...result,
      formData: formEntries,
    };
  };

  const [state, formAction] = useActionState(localFormAction, {
    error: "",
    validationErrors: [],
    formData: {
      name: "",
      email: "",
      request: "",
      description: "",
    },
  });

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
              focussable={true}
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

          <GcdsH1>{t("support.title")}</GcdsH1>
          <p className="mb-6">
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
<<<<<<< Updated upstream
          <form id="support" action={submitForm} noValidate>
=======
          <form
            id="support"
            // onSubmit={(e) => {
            //   e.preventDefault();
            //   submitForm(new FormData(e.currentTarget));
            // }}
            action={formAction}
            noValidate
          >
>>>>>>> Stashed changes
            {errors.error && (
              <Alert.Danger focussable={true} title={t("error")} className="my-2">
                <p>{t(errors.error)}</p>
              </Alert.Danger>
            )}

            <div className="gcds-input-wrapper mt-14">
              <Label id={"label-name"} htmlFor={"name"} className="required" required>
                {t("support.name")}
              </Label>
              <TextInputElement
                type={"text"}
                id={"name"}
                name={"name"}
                className="required w-[34rem]"
                validationError={getError("name")}
                defaultValue={state.formData?.name || ""}
              />
            </div>
            <div className="gcds-input-wrapper">
              <Label id={"label-email"} htmlFor={"email"} className="required" required>
                {t("support.email")}
              </Label>
              <TextInputElement
                type="text"
                id="email"
                name="email"
                className="required w-[34rem]"
                validationError={getError("email")}
                defaultValue={state.formData?.email || ""}
              />
            </div>
            <fieldset className="focus-group">
              <legend className="gc-label required">
                {t("support.request.title")}{" "}
                <span data-testid="required" aria-hidden>
                  ({t("required", { ns: "common" })})
                </span>
              </legend>
              <MultipleChoiceGroupElement
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
                    id: "request-technical-api",
                    name: "technical-api",
                    label: t("support.request.apiOption"),
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
                validationError={getError("request")}
              />
            </fieldset>
            <div className="gcds-textarea-wrapper">
              <Label id={"label-description"} htmlFor={"description"} className="required" required>
                {t("support.description.title")}
              </Label>
              <Description id={"description-description"}>
                {t("support.description.description")}
              </Description>

              {/* TODO */}

              {/* <TextArea
                id="description"
                name="description"
                className="required mt-4 w-[34rem]"
                error={getError("description")}
              /> */}
            </div>
            <SubmitButton>{t("submitButton", { ns: "common" })}</SubmitButton>
          </form>
        </>
      )}
    </>
  );
};
