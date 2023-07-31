import React, { ReactElement, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { TextInput, Label, Alert } from "@components/forms";
import { requireAuthentication, retrievePoolOfSecurityQuestions } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { Button, ErrorStatus } from "@components/globals";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { Select } from "@components/globals/Select/Select";
import { LinkButton } from "@components/globals";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { useRouter } from "next/router";
import { AxiosError } from "axios";

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

const updateSecurityQuestions = async (questionsAnswers: Answer[]): Promise<string> => {
  try {
    const data = { questionsWithAssociatedAnswers: [...questionsAnswers] };
    await fetchWithCsrfToken("/api/account/security-questions", data);
    return "success";
  } catch (err) {
    logMessage.error(err);

    // TODO may want to add "friendly" text or generalize error? Here are the response errors:
    // e.g. "Malformed request", "All security questions must be different", "Failed to create..

    // TODO typing if we stay with showing errors direct from the API
    const error = err as AxiosError;
    return error?.response && error?.response.data.error;
  }
};

const SetupSecurityQuestions = ({ questions = [] }: { questions: Question[] }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation(["setup-security-questions"]);
  const [formError, setFormError] = useState("");
  const supportHref = `/${i18n.language}/form-builder/support`;
  const formRef = useRef<QuestionValuesProps>(null);

  const validationSchema = Yup.object().shape({
    question1: Yup.string().required(t("errors.required")),
    answer1: Yup.string().required(t("errors.required")).min(4, t("errors.answerLength")),
    question2: Yup.string().required(t("errors.required")),
    answer2: Yup.string().required(t("errors.required")).min(4, t("errors.answerLength")),
    question3: Yup.string().required(t("errors.required")),
    answer3: Yup.string().required(t("errors.required")).min(4, t("errors.answerLength")),
  });

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>

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
          const data: Answer[] = [
            { questionId: values.question1, answer: values.answer1 },
            { questionId: values.question2, answer: values.answer2 },
            { questionId: values.question3, answer: values.answer3 },
          ];
          const result = await updateSecurityQuestions(data);

          // Fail, show an error
          if (result !== "success") {
            setFormError(result);
          }

          // Success, go to next step
          router.push({ pathname: `/${i18n.language}/myforms` });

          setSubmitting(false);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
      >
        {({ handleSubmit }) => (
          <>
            {formError && (
              <Alert
                type={ErrorStatus.ERROR}
                heading={t("errors.serverError.title")}
                id="formError"
                focussable={true}
              >
                {formError}
              </Alert>
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
                <Select id="question1" name="question1" className="mb-0 w-full rounded">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions
                    .filter((q) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          q.id === formRef.current.values.question2 ||
                          q.id === formRef.current.values.question3
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                </Select>
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
                <Select id="question2" name="question2" className="mb-0 w-full rounded">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions
                    .filter((q) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          q.id === formRef.current.values.question1 ||
                          q.id === formRef.current.values.question3
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                </Select>
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
                <Select id="question3" name="question3" className="mb-0 w-full rounded">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions
                    .filter((q) => {
                      if (formRef?.current && formRef.current?.values) {
                        if (
                          q.id === formRef.current.values.question1 ||
                          q.id === formRef.current.values.question2
                        ) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                </Select>
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

              <Button theme="primary" type="submit" className="mr-4">
                {t("continue")}
              </Button>
              <LinkButton.Secondary href={supportHref}>{t("contact")}</LinkButton.Secondary>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

SetupSecurityQuestions.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="laptop:w-[658px]">{page}</UserNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, email }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      // Removes any removed (deprecated) questions and formats for the related language
      const questions: Question[] = (await retrievePoolOfSecurityQuestions())
        .filter((q) => !q.deprecated)
        .map((q) => {
          return {
            id: q.id,
            question: locale === "fr" ? q.questionFr : q.questionEn,
          };
        });

      return {
        props: {
          email,
          questions,
          ...(locale &&
            (await serverSideTranslations(locale, ["setup-security-questions", "common"]))),
        },
      };
    }
  }
);

export default SetupSecurityQuestions;
