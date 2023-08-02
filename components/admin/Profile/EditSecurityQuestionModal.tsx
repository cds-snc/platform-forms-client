import React, { useRef, useState, useCallback } from "react";
import { Label } from "@components/forms";
import { Button } from "@components/globals";
import { useTranslation } from "next-i18next";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import { Question } from "pages/profile";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";

const updateSecurityQuestion = async (
  oldQuestionId: string,
  newQuestionId: string,
  answer: string | undefined
) => {
  const csrfToken = await getCsrfToken();

  if (csrfToken) {
    await axios.put(
      "/api/account/security-questions",
      {
        oldQuestionId: oldQuestionId,
        newQuestionId: newQuestionId,
        newAnswer: answer,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      }
    );
  }
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
  const { t, i18n } = useTranslation(["profile"]);
  const dialog = useDialogRef();
  const questionRef = useRef<HTMLSelectElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);
  const originalQuestionId = questionId;
  const router = useRouter();

  const [isFormError, setIsFormError] = useState(false);
  const [isFormWarning, setIsFormWarning] = useState(false);

  const [isAnswerInputError, setIsAnswerInputError] = useState(false);
  const isAnswerInputValid = (text: string | undefined): boolean => {
    if (text && text.length >= 4) {
      return true;
    }
    return false;
  };

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

      await updateSecurityQuestion(originalQuestionId, questionId, questionAnswer);

      dialog.current?.close();
      handleClose();
      router.push({
        pathname: `${i18n.language}/profile`,
      });
    } catch (err) {
      logMessage.error(err);
      setIsFormError(true);
    }
  };

  if (!questionNumber || !questionId || questions?.length <= 0) {
    return (
      <Dialog handleClose={handleClose} title={t("securityQuestionModal.title")} dialogRef={dialog}>
        <Attention
          type={AttentionTypes.ERROR}
          isAlert={true}
          classes="mb-6"
          heading={t("securityQuestionModal.errors.unknownError.title")}
        >
          <p className="text-sm text-[#26374a]">
            {t("securityQuestionModal.errors.unknownError.content")}
          </p>
        </Attention>
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
        {/* TODO: probably will not need the error since already selected questions can be removed programmatically */}
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
            <p className="text-sm font-bold text-[#26374a]">
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
            className="gc-dropdown mb-0 w-full rounded"
            defaultValue={questionId}
            ref={questionRef}
          >
            {questions.map((q: Question) => (
              <option key={q.id} value={q.id}>
                {q.questionEn}
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
              <p className="text-sm font-bold text-[#26374a]">
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
            onChange={_debouncedAnswerCheck}
          />
        </div>
      </>
    </Dialog>
  );
};
