import { serverTranslation } from "@i18n";
import { Icon } from "./Icon";
import { Question, QuestionList } from "./QuestionList";

interface ProfileProps {
  locale: string;
  email: string;
  publishingStatus: boolean;
  userQuestions: Question[];
  allQuestions: Question[];
}

export const Profile = async ({
  locale,
  email,
  publishingStatus,
  userQuestions = [],
  allQuestions = [],
}: ProfileProps) => {
  const { t } = await serverTranslation(["profile"], { lang: locale });

  return (
    <>
      <h1 className="mb-2 border-b-0">{t("title")}</h1>
      <div className="flex flex-col gap-4 tablet:flex-row">
        <div className="w-full rounded-lg border bg-white p-4 laptop:w-1/2">
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
        <div className="w-full rounded-lg border bg-white p-4 laptop:w-1/2">
          <h2 className="mb-6 pb-0 text-2xl">{t("securityPanel.title")}</h2>
          <QuestionList questions={userQuestions} allQuestions={allQuestions} />
        </div>
      </div>
    </>
  );
};
