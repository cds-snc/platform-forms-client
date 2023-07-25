import React, { useRef, useState } from "react";
import { Label } from "@components/forms";
import { Button } from "@components/globals";
import { useTranslation } from "next-i18next";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import { Question } from "pages/profile";

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
  questions: Question[];
  handleClose: () => void;
}) => {
  const { t } = useTranslation(["profile"]);
  const dialog = useDialogRef();
  const questionRef = useRef<HTMLSelectElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  // TODO: if state keeps growing, consider using a reducer or breakup into more components
  const [isFormError, setIsFormError] = useState(false);
  const [isFormWarning, setIsFormWarning] = useState(false);

  // TODO: probably move+related into a new fancy reusable Field component with children slot for Input/Select..
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

  // TODO: ask design about content for a Dialog fail error
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
      title={t("securityQuestionModal.title")}
      dialogRef={dialog}
      actions={
        <Button theme="primary" type="submit" onClick={handleSubmit}>
          {t("securityQuestionModal.save")}
        </Button>
      }
    >
      <>
        {/* TODO: probably will not need the error since it can be removed programmatically */}
        {isFormError && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            heading={t("securityQuestionModal.errors.formError.title")}
          >
            <p className="text-sm text-[#26374a]">
              {t("securityQuestionModal.errors.formError.content")}
            </p>
          </Attention>
        )}

        {isFormWarning && (
          <Attention type={AttentionTypes.WARNING} isAlert={true} isIcon={false} classes="mb-6">
            <p className="text-sm text-[#26374a] font-bold">
              {t("securityQuestionModal.errors.clickSave.title")}
            </p>
            <p className="text-sm text-[#26374a]">
              {t("securityQuestionModal.errors.clickSave.content")}
            </p>
          </Attention>
        )}

        <p>{t("securityQuestionModal.requirmentsList.title")}</p>
        <ul className="mb-6">
          <li>{t("securityQuestionModal.requirmentsList.requirement1")}</li>
          <li>{t("securityQuestionModal.requirmentsList.requirement2")}</li>
        </ul>

        <div className="mb-10">
          <Label id="questionLabel" htmlFor="question" className="required" required>
            {t("securityQuestionModal.questionLabel")} {questionNumber}
          </Label>
          <select
            name="question"
            id="questionLabel"
            className="gc-dropdown w-full rounded mb-0"
            defaultValue={questionId}
            ref={questionRef}
          >
            {questions.map((q: Question) => (
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
            {t("securityQuestionModal.answerLabel")} {questionNumber}
          </Label>
          {isAnswerInputError && (
            <Attention
              type={AttentionTypes.ERROR}
              isAlert={true}
              isIcon={false}
              isSmall={true}
              isLeftBorder={true}
            >
              <p className="text-sm text-[#26374a] font-bold">
                {t("securityQuestionModal.errors.invalidInput")}
              </p>
            </Attention>
          )}
          <input
            className={`gc-input-text w-full rounded ${isAnswerInputError ? "border-red" : ""}`}
            id="answer"
            name="answer"
            type="text"
            ref={answerRef}
            onBlur={() => {
              // NOTE: temporary work around for issue of clicking on save causing miss-click and
              // and pushing save button down (then no longer clicking save button). A better fix
              // will probably require refactoring how form elements work in the dialog.
              setTimeout(() => {
                if (!isAnswerInputValid(answerRef.current?.value)) {
                  setIsFormWarning(false);
                  setIsAnswerInputError(true);
                  return;
                }

                setIsAnswerInputError(false);
                setIsFormWarning(true);
              }, 200);
            }}
          />
        </div>
      </>
    </Dialog>
  );
};
