import React, { ReactElement, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextInput, Label, Alert } from "@components/forms";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges } from "@lib/privileges";
import { Button, ErrorStatus } from "@components/globals";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { Select } from "@components/globals/Select/Select";
import { LinkButton } from "@components/globals";

// TODO move to types once data structure decided on?
export interface Question {
  id: string;
  text: string;
}
export interface QuestionsAnswer {
  id: string;
  question: string;
  answer: string;
}

const updateSecurityQuestions = async (questionsAnswers: QuestionsAnswer[]) => {
  // TODO api call
  return true;
};

const SetupSecurityQuestions = ({ questions = [] }: { questions: Question[] }) => {
  const { t, i18n } = useTranslation(["setup-security-questions"]);
  const [isFormError, setIsFormError] = useState(false);
  const supportHref = `/${i18n.language}/form-builder/support`;

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
        initialValues={{
          question1: "",
          answer1: "",
          question2: "",
          answer2: "",
          question3: "",
          answer3: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          const data = {
            question1: values.question1,
            answer1: values.answer1,
            question2: values.question2,
            answer2: values.answer2,
            question3: values.question3,
            answer3: values.answer3,
          };

          alert("submitted " + JSON.stringify(data));
          // TODO
          // const result = await updateSecurityQuestions(data);
          // if (result) {
          // }

          setSubmitting(false);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={validationSchema}
        // validate={authErrorsReset}
        // onReset={authErrorsReset}
      >
        {({ handleSubmit, errors }) => (
          <>
            {isFormError && (
              <Alert
                type={ErrorStatus.ERROR}
                heading={t("errortitle")}
                id="formError"
                focussable={true}
              >
                TODO form error(s)
                {/* {authErrorsState.description}
                {authErrorsState.callToActionLink ? (
                  <Link href={authErrorsState.callToActionLink}>
                    {authErrorsState.callToActionText}
                  </Link>
                ) : undefined}
                . */}
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
                <Select id="question1" name="question1" className="w-full rounded mb-0">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions.map((q) => (
                    <option key={q.id} value={q.text}>
                      {q.text}
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
                <Select id="question2" name="question2" className="w-full rounded mb-0">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions.map((q) => (
                    <option key={q.id} value={q.text}>
                      {q.text}
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
                <Select id="question3" name="question3" className="w-full rounded mb-0">
                  {
                    <option key={"default"} value="">
                      {t("questionPlaceholder")}
                    </option>
                  }
                  {questions.map((q) => (
                    <option key={q.id} value={q.text}>
                      {q.text}
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

      // @todo pull from API
      const questions = [
        { id: "100", text: "Placeholder what was your favourite school subject?" },
        { id: "101", text: "Placeholder what was the name of your first manager?" },
        { id: "102", text: "Placeholder what was the make of your first car?" },
      ];

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
