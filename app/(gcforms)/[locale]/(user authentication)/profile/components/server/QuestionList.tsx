import { serverTranslation } from "@i18n";

import { EditSecurityQuestionButton } from "../client/EditSecurityQuestionModal";

export interface Question {
  id: string;
  questionEn: string;
  questionFr: string;
}

export const QuestionList = async ({
  questions = [],
  allQuestions = [],
}: {
  questions: Question[];
  allQuestions: Question[];
}) => {
  const { t, i18n } = await serverTranslation(["profile"]);

  const langKey = i18n.language === "en" ? "questionEn" : "questionFr";

  if (!questions.length) {
    return null;
  }
  const filteredQuestions = allQuestions.filter((q) => !questions.some((uq) => uq.id === q.id));

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

              <EditSecurityQuestionButton
                questionNumber={index + 1}
                questionId={question.id}
                // Add back the existing selected question
                questions={[...filteredQuestions, question]}
              />
            </div>
          );
        })}
      </ul>
    </>
  );
};
