"use client";
import { useTranslation } from "@i18n/client";
import {
  Label,
  Alert as ValidationMessage,
  ErrorListItem,
  Description,
} from "@clientComponents/forms";
import { Button } from "@clientComponents/globals";
import { ErrorStatus } from "@clientComponents/forms/Alert/Alert";
import { useState } from "react";
import { support } from "../../actions";
import Link from "next/link";
import { Alert } from "@clientComponents/globals";
import { TextInput } from "../../../components/client/TextInput";
import { useFormState } from "react-dom";
import { MultipleChoiceGroup } from "../../../components/client/MultipleChoiceGroup";
import { TextArea } from "../../../components/client/TextArea";

const initialState = {
  name: "",
  email: "",
  request: "",
  description: "",
};

export const SupportForm = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);
  const [errors, setErrors] = useState({});

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (prevState: any, formData: FormData) => {
    const result = await support({ formData, language });
    if (result?.errors) {
      setErrors(result?.errors);
    }
    return prevState;
  };

  const [formAction] = useFormState(handleSubmit, initialState);

  return (
    <>
      {/* 
          TODO: probably remove - replaced by error boundary error
          {errorMessage && (
          <ErrorPanel supportLink={false}>{t("server-error", { ns: "common" })}</ErrorPanel>
      )} */}

      {/* {`DEBUG=>${JSON.stringify(errors)}`} */}

      {errors && Object.keys(errors).length > 0 && (
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
                <ErrorListItem key={`error-${fieldKey}`} errorKey={fieldKey} value={fieldValue} />
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
      <form id="support" action={formAction}>
        <div className="focus-group mt-14">
          <Label id={"label-name"} htmlFor={"name"} className="required" required>
            {t("support.name")}
          </Label>
          <TextInput
            type={"text"}
            id={"name"}
            name={"name"}
            className="required w-[34rem]"
            error={errors?.name}
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
            error={errors?.email}
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
            error={errors?.request}
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
            error={errors?.description}
          />
        </div>
        <Button type="submit" theme="primary">
          {t("submitButton", { ns: "common" })}
        </Button>
      </form>
    </>
  );
};
