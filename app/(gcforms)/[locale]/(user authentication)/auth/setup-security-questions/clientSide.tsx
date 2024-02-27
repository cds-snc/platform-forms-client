"use client";
import React, { useRef, useState } from "react";

import { useTranslation } from "@i18n/client";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { TextInput, Label, Dropdown } from "@clientComponents/forms";
import { Button, Alert } from "@clientComponents/globals";
import { LinkButton } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { useRouter } from "next/navigation";
import { toast } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";

export interface Question {
  id: string;
  question: string;
}

export interface Answer {
  questionId: string;
  answer: string;
}

interface QuestionAnswerValues {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  question3: string;
  answer3: string;
}

type QuestionValuesProps = FormikProps<QuestionAnswerValues>;

type ErrorResult = {
  response: {
    data: {
      error: string;
    };
  };
};

const updateSecurityQuestions = async (questionsAnswers: Answer[]): Promise<Error | undefined> => {
  try {
    const data = { questionsWithAssociatedAnswers: [...questionsAnswers] };
    await fetchWithCsrfToken("/api/account/security-questions", data);
  } catch (err) {
    logMessage.error(err);
    const error = err as ErrorResult;
    return error?.response && new Error(error?.response?.data?.error);
  }
};

export const SetupSecurityQuestions = ({ questions = [] }: { questions: Question[] }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["setup-security-questions"]);
  const [formError, setFormError] = useState("");
  const supportHref = `/${i18n.language}/support`;
  const formRef = useRef<QuestionValuesProps>(null);

  const validationSchema = Yup.object().shape({
    question1: Yup.string().required(t("errors.required")),
    answer1: Yup.string()
      .required(t("errors.required"))
      .min(4, t("errors.answerLength"))
      .test("duplicate-answer1", t("errors.duplicateAnswer"), function (answer1) {
        const values = this?.parent || {};
        if (answer1 === values.answer2 || answer1 === values.answer3) {
          return false;
        }
        return true;
      }),
    question2: Yup.string().required(t("errors.required")),
    answer2: Yup.string()
      .required(t("errors.required"))
      .min(4, t("errors.answerLength"))
      .test("duplicate-answer2", t("errors.duplicateAnswer"), function (answer2) {
        const values = this?.parent || {};
        if (answer2 === values.answer1 || answer2 === values.answer3) {
          return false;
        }
        return true;
      }),
    question3: Yup.string().required(t("errors.required")),
    answer3: Yup.string()
      .required(t("errors.required"))
      .min(4, t("errors.answerLength"))
      .test("duplicate-answer3", t("errors.duplicateAnswer"), function (answer3) {
        const values = this?.parent || {};
        if (answer3 === values.answer1 || answer3 === values.answer2) {
          return false;
        }
        return true;
      }),
  });

  return (
    <Formik
      innerRef={formRef}
      initialValues={{
        question1: "",
        answer1: "",
        question2: "",
        answer2: "",
        question3: "",
        answer3: "",
      }}
      onSubmit={async (values, { setSubmitting }) => {
        setFormError("");
        setSubmitting(true);
        const data: Answer[] = [
          { questionId: values.question1, answer: values.answer1 },
          { questionId: values.question2, answer: values.answer2 },
          { questionId: values.question3, answer: values.answer3 },
        ];
        const result = await updateSecurityQuestions(data);

        // Fail, show an error
        if (result && result instanceof Error) {
          setFormError(result.message);
          setSubmitting(false);
        } else {
          toast.success(t("success.title"));
          // Note: Await so async call will not auto resolve and "flash" the submit to enabled while loading.
          router.push(`/${i18n.language}/auth/policy`);
        }
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, isSubmitting }) => (
        <>
          {formError && (
            <Alert.Danger title={t("errors.serverError.title")} id="formError" focussable={true}>
              {formError}
            </Alert.Danger>
          )}

          <h1 className="gc-h2">{t("title")}</h1>

          <form id="updateSecurityQuestionsForm" method="POST" onSubmit={handleSubmit} noValidate>
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
              <Dropdown id="question1" name="question1" className="mb-0 w-full rounded">
                <>
                  <option key={"default"} value="">
                    {t("questionPlaceholder")}
                  </option>
                  {questions
                    .filter(({ id }) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          id === formRef.current.values.question2 ||
                          id === formRef.current.values.question3
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
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
              />
            </fieldset>

            <fieldset className="focus-group">
              <legend className="sr-only">{t("secondQuestion")}</legend>
              <Label id={"label-question2"} htmlFor={"question2"} className="required" required>
                {t("question")} 2
              </Label>
              <Dropdown id="question2" name="question2" className="mb-0 w-full rounded">
                <>
                  <option key={"default"} value="">
                    {t("questionPlaceholder")}
                  </option>
                  {questions
                    .filter(({ id }) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          id === formRef.current.values.question1 ||
                          id === formRef.current.values.question3
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
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
              />
            </fieldset>

            <fieldset className="focus-group">
              <legend className="sr-only">{t("thirdQuestion")}</legend>
              <Label id={"label-question3"} htmlFor={"question3"} className="required" required>
                {t("question")} 3
              </Label>
              <Dropdown id="question3" name="question3" className="mb-0 w-full rounded">
                <>
                  <option key={"default"} value="">
                    {t("questionPlaceholder")}
                  </option>
                  {questions
                    .filter(({ id }) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          id === formRef.current.values.question1 ||
                          id === formRef.current.values.question2
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
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
              />
            </fieldset>

            <Button theme="primary" type="submit" className="mr-4" disabled={isSubmitting}>
              {t("continue")}
            </Button>
            <LinkButton.Secondary href={supportHref}>{t("support")}</LinkButton.Secondary>
          </form>
        </>
      )}
    </Formik>
  );
};
