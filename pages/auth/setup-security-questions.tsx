import React, { ReactElement, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { TextInput, Label, Alert, Dropdown } from "@components/forms";
import {
  requireAuthentication,
  retrievePoolOfSecurityQuestions,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { Button, ErrorStatus } from "@components/globals";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";
import { logMessage } from "@lib/logger";
import { fetchWithCsrfToken } from "@lib/hooks/auth/fetchWithCsrfToken";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import * as AlertBanner from "@components/globals/Alert/Alert";
import { toast } from "@formbuilder/app/shared";

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

const Info = () => {
  const { t } = useTranslation(["setup-security-questions"]);
  return (
    <div className="mx-auto mt-10 w-[850px]">
      <AlertBanner.Info title={t("banner.title")} body={t("banner.body")} />
    </div>
  );
};

const updateSecurityQuestions = async (questionsAnswers: Answer[]): Promise<Error | undefined> => {
  try {
    const data = { questionsWithAssociatedAnswers: [...questionsAnswers] };
    await fetchWithCsrfToken("/api/account/security-questions", data);
  } catch (err) {
    logMessage.error(err);
    const error = err as AxiosError;
    return error?.response && new Error(error.response.data.error);
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
          } else {
            toast.success(t("success.title"));
            // Note: Await so async call will not auto resolve and "flash" the submit to enabled while loading.
            await router.push({ pathname: `/${i18n.language}/myforms` });
          }

          setSubmitting(false);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isSubmitting }) => (
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
              <LinkButton.Secondary href={supportHref}>{t("contact")}</LinkButton.Secondary>
            </form>
          </>
        )}
      </Formik>
    </>
  );
};

SetupSecurityQuestions.getLayout = (page: ReactElement) => {
  return (
    <UserNavLayout beforeContentWrapper={<Info />} contentWidth="tablet:w-[658px]">
      {page}
    </UserNavLayout>
  );
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, email }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      const sessionSecurityQuestions = await retrieveUserSecurityQuestions({
        userId: ability.userID,
      });
      if (sessionSecurityQuestions && sessionSecurityQuestions.length >= 3) {
        return {
          redirect: {
            destination: "/profile",
            permanent: false,
          },
        };
      }

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
