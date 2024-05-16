"use client";
import React, { useRef, useState, useCallback } from "react";
import { Label } from "@clientComponents/forms";
import { Button, Alert } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { logMessage } from "@lib/logger";
import { updateSecurityQuestion } from "../../action";
import debounce from "lodash.debounce";
import {
  MessageType,
  ValidationMessage,
} from "@clientComponents/globals/ValidationMessage/ValidationMessage";

interface Question {
  id: string;
  questionEn: string;
  questionFr: string;
}

export const EditSecurityQuestionButton = ({
  questionNumber,
  questionId,
  questions,
}: {
  questionNumber: number;
  questionId: string;
  questions: Question[];
}) => {
  const { t } = useTranslation(["profile"]);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
        theme="link"
        className="self-start !px-2 text-lg"
      >
        {t("securityPanel.edit")}
      </Button>
      {showModal && (
        <EditSecurityQuestionModal
          questionNumber={questionNumber}
          questionId={questionId}
          questions={questions}
          handleClose={async () => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

const EditSecurityQuestionModal = ({
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
  const { t, i18n } = useTranslation(["profile"]);
  const dialog = useDialogRef();
  const questionRef = useRef<HTMLSelectElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);
  const originalQuestionId = questionId;

  const [isFormError, setIsFormError] = useState(false);
  const [isFormWarning, setIsFormWarning] = useState(false);

  const [isAnswerInputError, setIsAnswerInputError] = useState(false);
  const isAnswerInputValid = (text: string | undefined): boolean => {
    if (text && text.length >= 4) {
      return true;
    }
    return false;
  };

  const langKey = i18n.language === "en" ? "questionEn" : "questionFr";

  const _debouncedAnswerCheck = debounce(
    useCallback(() => {
      if (!isAnswerInputValid(answerRef.current?.value)) {
        setIsFormWarning(false);
        setIsAnswerInputError(true);
        return;
      }

      setIsAnswerInputError(false);
      setIsFormWarning(true);
    }, []),
    500
  );

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

      const response = await updateSecurityQuestion(originalQuestionId, questionId, questionAnswer);
      if (response?.error) {
        throw new Error(response.error);
      }
      dialog.current?.close();
      handleClose();
    } catch (err) {
      logMessage.error(err);
      setIsFormError(true);
    }
  };

  if (!questionNumber || !questionId || questions?.length <= 0) {
    return (
      <Dialog handleClose={handleClose} title={t("securityQuestionModal.title")} dialogRef={dialog}>
        <Alert.Danger className="mb-4">
          <Alert.Title headingTag="h3">
            {t("securityQuestionModal.errors.unknownError.title")}
          </Alert.Title>
          <p className="text-sm text-[#26374a]">
            {t("securityQuestionModal.errors.unknownError.content")}
          </p>
        </Alert.Danger>
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
      <div className="px-4">
        {/* TODO: probably will not need the error since already selected questions can be removed programmatically */}
        {isFormError && (
          <Alert.Danger>
            <Alert.Title headingTag="h3">
              {t("securityQuestionModal.errors.formError.title")}
            </Alert.Title>
            <p className="text-sm">{t("securityQuestionModal.errors.formError.content")}</p>
          </Alert.Danger>
        )}

        {isFormWarning && (
          <Alert.Warning icon={false} className="mb-4">
            <p className="text-sm font-bold">{t("securityQuestionModal.errors.clickSave.title")}</p>
            <p className="text-sm">{t("securityQuestionModal.errors.clickSave.content")}</p>
          </Alert.Warning>
        )}

        <p className="mt-4">{t("securityQuestionModal.requirmentsList.title")}</p>
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
            className="gc-dropdown mb-0 w-full rounded"
            defaultValue={questionId}
            ref={questionRef}
          >
            {questions.map((q: Question) => (
              <option key={q.id} value={q.id}>
                {q[langKey]}
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

          <ValidationMessage show={isAnswerInputError} messageType={MessageType.ERROR}>
            {t("securityQuestionModal.errors.invalidInput")}
          </ValidationMessage>

          <span id="answerHint" className="visually-hidden">
            {t("securityQuestionModal.errors.invalidInput")}
          </span>

          <input
            className={`gc-input-text w-full rounded ${isAnswerInputError ? "border-red" : ""}`}
            id="answer"
            name="answer"
            type="text"
            aria-invalid={isAnswerInputError}
            aria-describedby="answerHint"
            ref={answerRef}
            onChange={_debouncedAnswerCheck}
          />
        </div>
      </div>
    </Dialog>
  );
};
