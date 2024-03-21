"use client";
import React, { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslation } from "@i18n/client";
import { TextInput, Label, Dropdown } from "../../../../components/client/forms";
import { Button, Alert } from "@clientComponents/globals";
import { LinkButton } from "@clientComponents/globals";
import { useRouter } from "next/navigation";
import { toast } from "@formBuilder/components/shared";
import { ErrorStates } from "../../actions";
import { setupQuestions } from "../../actions";

export interface Question {
  id: string;
  question: string;
}

const SubmitButton = () => {
  const { t } = useTranslation(["setup-security-questions"]);
  const { pending } = useFormStatus();

  return (
    <Button theme="primary" type="submit" className="mr-4" disabled={pending}>
      {t("continue")}
    </Button>
  );
};

export const SecurityQuestionsForm = ({ questions = [] }: { questions: Question[] }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["setup-security-questions"]);

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  const supportHref = `/${i18n.language}/support`;

  const localFormAction = async (
    language: string,
    _: ErrorStates,
    formData: FormData
  ): Promise<ErrorStates> => {
    const result = await setupQuestions(language, _, formData);
    if (!result.validationErrors && !result.generalError) {
      toast.success(t("success.title"));
      router.push(`/${i18n.language}/auth/policy`);
    }

    return result;
  };

  const [state, formAction] = useFormState(localFormAction.bind(null, i18n.language), {});

  const onSelect = () => {
    if (formRef.current !== null) {
      const question1Value = (formRef.current.elements.namedItem("question1") as HTMLInputElement)
        ?.value;
      const question2Value = (formRef.current.elements.namedItem("question2") as HTMLInputElement)
        ?.value;
      const question3Value = (formRef.current.elements.namedItem("question3") as HTMLInputElement)
        ?.value;
      setSelectedQuestions([question1Value, question2Value, question3Value]);
    }
  };

  return (
    <>
      {state.generalError && (
        <Alert.Danger title={t("errors.serverError.title")} id="formError" focussable={true}>
          {state.generalError}
        </Alert.Danger>
      )}

      <h1 className="gc-h2">{t("title")}</h1>

      <form
        id="updateSecurityQuestionsForm"
        ref={formRef}
        method="POST"
        action={formAction}
        noValidate
      >
        <div className="mb-10 mt-4">
          <p className="font-bold">{t("description")}</p>
          <p id="requirementsListTitle">{t("requirementsTitle")}</p>
          <ul aria-labelledby="requirementsListTitle">
            <li>{t("requirements1")}</li>
            <li>{t("requirements2")}</li>
          </ul>
        </div>

        <fieldset className="focus-group">
          <legend className="sr-only">{t("firstQuestion")}</legend>
          <Label id={"label-question1"} htmlFor={"question1"} className="required" required>
            {t("question")} 1
          </Label>
          <Dropdown
            id="question1"
            name="question1"
            className="mb-0 w-full rounded"
            onChange={onSelect}
          >
            <>
              <option key={"default"} value="">
                {t("questionPlaceholder")}
              </option>
              {questions
                .filter((q) => !selectedQuestions.toSpliced(0, 1).includes(q.id))
                .map(({ id, question }) => (
                  <option key={id} value={id}>
                    {question}
                  </option>
                ))}
            </>
          </Dropdown>
          <Label id={"label-answer1"} htmlFor={"answer1"} className="required mt-6" required>
            {t("answer")}
          </Label>
          <TextInput
            className="gc-input-text w-full rounded"
            type={"text"}
            id={"answer1"}
            name={"answer1"}
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "answer1")?.fieldValue
            }
          />
        </fieldset>

        <fieldset className="focus-group">
          <legend className="sr-only">{t("secondQuestion")}</legend>
          <Label id={"label-question2"} htmlFor={"question2"} className="required" required>
            {t("question")} 2
          </Label>
          <Dropdown
            id="question2"
            name="question2"
            className="mb-0 w-full rounded"
            onChange={onSelect}
          >
            <>
              <option key={"default"} value="">
                {t("questionPlaceholder")}
              </option>
              {questions
                .filter((q) => !selectedQuestions.toSpliced(1, 1).includes(q.id))
                .map(({ id, question }) => (
                  <option key={id} value={id}>
                    {question}
                  </option>
                ))}
            </>
          </Dropdown>
          <Label id={"label-answer2"} htmlFor={"answer2"} className="required mt-6" required>
            {t("answer")}
          </Label>
          <TextInput
            className="gc-input-text w-full rounded"
            type={"text"}
            id={"answer2"}
            name={"answer2"}
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "answer2")?.fieldValue
            }
          />
        </fieldset>

        <fieldset className="focus-group">
          <legend className="sr-only">{t("thirdQuestion")}</legend>
          <Label id={"label-question3"} htmlFor={"question3"} className="required" required>
            {t("question")} 3
          </Label>
          <Dropdown
            id="question3"
            name="question3"
            className="mb-0 w-full rounded"
            onChange={onSelect}
          >
            <>
              <option key={"default"} value="">
                {t("questionPlaceholder")}
              </option>
              {questions
                .filter((q) => !selectedQuestions.toSpliced(2, 1).includes(q.id))
                .map(({ id, question }) => (
                  <option key={id} value={id}>
                    {question}
                  </option>
                ))}
            </>
          </Dropdown>
          <Label id={"label-answer3"} htmlFor={"answer3"} className="required mt-6" required>
            {t("answer")}
          </Label>
          <TextInput
            className="gc-input-text w-full rounded"
            type={"text"}
            id={"answer3"}
            name={"answer3"}
            required
            validationError={
              state.validationErrors?.find((e) => e.fieldKey === "answer3")?.fieldValue
            }
          />
        </fieldset>

        <SubmitButton />
        <LinkButton.Secondary href={supportHref}>{t("support")}</LinkButton.Secondary>
      </form>
    </>
  );
};
