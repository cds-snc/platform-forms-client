import React, { useRef, useState } from "react";
import { Label } from "@components/forms";
import { Button } from "@components/globals";
import { useTranslation } from "next-i18next";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";

// TODO: Dialog component currently takes actions to control the dialog behavior. Would be nice to
// be able to wire with a form element to work with onSubmit and button type=submit to get form
// behaviors like keying enter in an input to submit the form.

const updateSecurityQuestion = async (id: string, answer: string | undefined) => {
  // TOD API Call
  alert(`TODO API POST id=${id}, answer=${answer}`);

  // throw an error if any
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
  const questionRef = useRef<HTMLSelectElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  // TODO: if state keeps growing, consider using a reducer or breakup into more components
  const [isFormError, setIsFormError] = useState(false);
  const [isFormWarning, setIsFormWarning] = useState(false);

  // TODO: probably move+related into a separate Field component with children slot for Input/Select..
  const [isAnswerInputError, setIsAnswerInputError] = useState(false);
  const isAnswerInputValid = (text: string | undefined): boolean => {
    if (text && text.length >= 4) {
      return true;
    }
    return false;
  };

  const reset = () => {
    setIsFormError(false);
    setIsFormWarning(false);
    setIsAnswerInputError(false);
  };

  const handleSubmit = async () => {
    try {
      reset();

      const questionId = questionRef.current?.value;
      const questionAnswer = answerRef.current?.value;

      if (!questionId) {
        throw Error("Question Id required for security question API call");
      }

      if (!isAnswerInputValid(questionAnswer)) {
        setIsAnswerInputError(true);
        return;
      }

      await updateSecurityQuestion(questionId, questionAnswer);

      dialog.current?.close();
      handleClose();
    } catch (err) {
      logMessage.error(err);
      setIsFormError(true);
    }
  };

  if (!questionNumber || !questionId || questions?.length <= 0) {
    return (
      <Dialog title={t("errorTodo")} dialogRef={dialog}>
        <p>TODO missing dialog data</p>
      </Dialog>
    );
  }

  return (
    <Dialog
      handleClose={handleClose}
      title={t("editSecurityQuestions")}
      dialogRef={dialog}
      actions={
        <Button theme="primary" type="submit" onClick={handleSubmit}>
          {t("todo save")}
        </Button>
      }
    >
      <>
        {isFormError && (
          <Attention type={AttentionTypes.ERROR} isAlert={true} heading={t("todo heading")}>
            <p className="text-sm text-[#26374a]">{t("todo content")}</p>
          </Attention>
        )}
        {isFormWarning && (
          <Attention type={AttentionTypes.WARNING} isAlert={true} isIcon={false} classes="mb-6">
            <p className="text-sm text-[#26374a] font-bold">{t("todo title?")}</p>
            <p className="text-sm text-[#26374a]">{t("todo content")}</p>
          </Attention>
        )}

        <p>todo</p>
        <ul className="mb-6">
          <li>todo</li>
          <li>todo</li>
        </ul>

        <div className="mb-10">
          <Label id="questionLabel" htmlFor="question" className="required" required>
            {t("TODO question")} {questionNumber}
          </Label>
          <select
            name="question"
            id="questionLabel"
            className="gc-dropdown w-full rounded mb-0"
            defaultValue={questionId}
            ref={questionRef}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-10">
          <Label
            id="answerLabel"
            htmlFor="answer"
            className={`required ${isAnswerInputError ? "text-red" : ""}`}
            required
          >
            {t("TODO answer")} {questionNumber}
          </Label>
          {isAnswerInputError && (
            <Attention
              type={AttentionTypes.ERROR}
              isAlert={true}
              isIcon={false}
              isSmall={true}
              isLeftBorder={true}
              // heading={t("todo heading")}
            >
              <p className="text-sm text-[#26374a] font-bold">{t("todo content")}</p>
            </Attention>
          )}
          <input
            className={`gc-input-text w-full rounded ${isAnswerInputError ? "border-red" : ""}`}
            id="answer"
            name="answer"
            type="text"
            ref={answerRef}
            onBlur={() => {
              if (!isAnswerInputValid(answerRef.current?.value)) {
                setIsAnswerInputError(true);
                return;
              }

              setIsAnswerInputError(false);
              setIsFormWarning(true);
            }}
          />
        </div>
      </>
    </Dialog>
  );
};
