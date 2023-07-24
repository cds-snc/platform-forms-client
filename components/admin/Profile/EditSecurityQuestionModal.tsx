import React, { useState } from "react";
import { Formik, Field } from "formik";
import { TextInput, Label, Alert } from "@components/forms";
import { Button } from "@components/globals";
import { useTranslation } from "next-i18next";
import * as Yup from "yup";
import { ErrorStatus } from "@components/forms/Alert/Alert";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";

const updateSecurityQuestion = async (id: string, answer: string) => {
  // TOD API Call
  alert(`submitted id=${id}, answer=${answer}`);
  return true;
};

export const EditSecurityQuestionModal = ({
  questionNumber,
  questionId,
  questions,
  handleClose,
}: {
  questionNumber: number;
  questionId: string;
  questions: any; // TODO
  handleClose: () => void;
}) => {
  const { t } = useTranslation(["profile"]);
  const dialog = useDialogRef();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormWarning, setIsFormWarning] = useState(false);

  const validationSchema = Yup.object().shape({
    answer: Yup.string()
      .required(t("input-validation.required", { ns: "common" }))
      .min(4, t("error.minLength", { ns: "common" }))
      .max(50, t("error.maxLength", { ns: "common" })), // TODO: may want to ask about a max
  });

  if (!questionNumber || !questionId || questions?.length <= 0) {
    return (
      <Dialog title={t("errorTodo")} dialogRef={dialog}>
        <p>TODO missing dialog data</p>
      </Dialog>
    );
  }

  return (
    <Dialog handleClose={handleClose} title={t("editSecurityQuestions")} dialogRef={dialog}>
      <>
        <Formik
          initialValues={{ question: "", answer: "" }}
          onSubmit={async (values, { setSubmitting }) => {
            const data = {
              id: values.question,
              answer: values.answer,
            };

            // TODO think about error handling
            await updateSecurityQuestion(data.id, data.answer);

            setSubmitting(false);
          }}
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={validationSchema}
        >
          {({ handleSubmit, errors }) => (
            <>
              {isFormError && (
                <Alert
                  type={ErrorStatus.ERROR}
                  heading={"todo"}
                  onDismiss={() => setIsFormError(false)}
                  focussable={true}
                  id="formError"
                >
                  TODO
                </Alert>
              )}
              <p>todo</p>
              <ul>
                <li>todo</li>
                <li>todo</li>
              </ul>
              <form id="editSecurityQuestion" method="POST" onSubmit={handleSubmit} noValidate>
                <div className="focus-group">
                  <Label id="questionLabel" htmlFor="question" className="required" required>
                    {t("TODO question")} {questionNumber}
                  </Label>
                  <Field as="select" name="question" className="" id="questionLabel">
                    {questions.map((q) => {
                      const isSelected = questionId === q.id;
                      return (
                        <option key={q.id} value={q.id} {...(isSelected && { defaultValue: true })}>
                          {q.text}
                        </option>
                      );
                    })}
                  </Field>
                </div>

                <div className="focus-group">
                  <Label id="answerLabel" htmlFor="answer" className="required" required>
                    {t("TODO answer")} {questionNumber}
                  </Label>
                  <TextInput
                    className="h-10 w-full max-w-lg rounded"
                    id="answer"
                    name="answer"
                    type="text"
                  />
                </div>

                <Button theme="primary" type="submit">
                  {t("save")}
                </Button>
              </form>
            </>
          )}
        </Formik>
      </>
    </Dialog>
  );
};
