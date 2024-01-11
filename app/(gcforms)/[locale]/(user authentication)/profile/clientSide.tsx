"use client";
import React, { useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { CancelIcon, CircleCheckIcon } from "@clientComponents/icons";
import { EditSecurityQuestionModal } from "@clientComponents/admin/Profile/EditSecurityQuestionModal";

interface ProfileProps {
  email: string;
  publishingStatus: boolean;
  userQuestions: Question[];
  allQuestions: Question[];
}

export interface Question {
  id: string;
  questionEn: string;
  questionFr: string;
}

const Icon = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
  ) : (
    <CancelIcon className="mr-2 inline-block h-9 w-9 fill-red-700" />
  );
};

const Questions = ({
  questions = [],
  allQuestions = [],
}: {
  questions: Question[];
  allQuestions: Question[];
}) => {
  const { t, i18n } = useTranslation(["profile"]);
  const [showEditSecurityQuestionModal, setShowEditSecurityQuestionModal] = useState(false);
  const langKey = i18n.language === "en" ? "questionEn" : "questionFr";

  // TODO: if the list of state grows, use a reducer
  const editQuestionNumber = useRef(0);
  const editQuestionId = useRef("");
  // const editQuestionsList = useRef(null);

  if (!questions.length) {
    return null;
  }

  return (
    <>
      <ul className="m-0 list-none p-0">
        {questions.map((question, index) => {
          return (
            <div className="flex justify-between" key={index}>
              <div className="mb-4">
                <h3 className="mb-2 text-xl">
                  {t("securityPanel.question")} {index + 1}
                </h3>
                <p>{question[langKey]}</p>
              </div>

              <Button
                onClick={() => {
                  editQuestionNumber.current = index + 1;
                  editQuestionId.current = question.id;

                  // TODO: uses a list that filters out already used questions to simplify
                  setShowEditSecurityQuestionModal(true);
                }}
                theme="link"
                className="!px-2 text-lg self-start"
              >
                {t("securityPanel.edit")}
              </Button>
            </div>
          );
        })}
      </ul>
      {showEditSecurityQuestionModal && (
        <EditSecurityQuestionModal
          questionNumber={editQuestionNumber.current}
          questionId={editQuestionId.current}
          questions={allQuestions}
          handleClose={async () => {
            setShowEditSecurityQuestionModal(false);
          }}
        />
      )}
    </>
  );
};

export const Profile = ({
  email,
  publishingStatus,
  userQuestions = [],
  allQuestions = [],
}: ProfileProps) => {
  const { t } = useTranslation(["profile"]);

  return (
    <>
      <div className="!ml-[90px] laptop:ml-60">
        <h1 className="mb-2 border-b-0">{t("title")}</h1>
        <div className="flex flex-col gap-4 tablet:flex-row">
          <div className="w-full rounded-lg border p-4  laptop:w-1/2">
            <h2 className="mb-6 pb-0 text-2xl">{t("accountPanel.title")}</h2>
            <div>
              <h3 className="mb-2 text-xl">{t("accountPanel.email")}</h3>
              <p className="mb-4">{email}</p>
            </div>
            <div>
              <h3 className="mb-2 text-xl">{t("accountPanel.publishing")}</h3>
              <p className="mb-4">
                <Icon checked={publishingStatus} />{" "}
                {publishingStatus ? t("accountPanel.unlocked") : t("accountPanel.locked")}
              </p>
            </div>
          </div>
          <div className="w-full rounded-lg border p-4 laptop:w-1/2">
            <h2 className="mb-6 pb-0 text-2xl">{t("securityPanel.title")}</h2>
            <Questions questions={userQuestions} allQuestions={allQuestions} />
          </div>
        </div>
      </div>
    </>
  );
};
