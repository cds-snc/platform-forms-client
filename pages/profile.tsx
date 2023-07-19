import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Head from "next/head";

import { NextPageWithLayout } from "@pages/_app";
import { requireAuthentication } from "@lib/auth";
import { checkPrivileges, checkPrivilegesAsBoolean } from "@lib/privileges";
import { Template } from "@components/form-builder/app";
import { Button } from "@components/globals";
import { CancelIcon, CircleCheckIcon } from "@components/form-builder/icons";

interface ProfileProps {
  email: string;
  publishingStatus: boolean;
  userQuestions: { text: string }[];
}

const Icon = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
  ) : (
    <CancelIcon className="mr-2 inline-block h-9 w-9 fill-red-700" />
  );
};

const Questions = ({ questions = [] }: { questions: { text: string }[] }) => {
  const { t } = useTranslation(["profile"]);

  if (!questions.length) {
    return null;
  }

  return (
    <ul className="list-none p-0 m-0">
      {questions.map((question, index) => {
        return (
          <li key={index}>
            <div className="flex justify-between">
              <h3 className="mb-2 text-sm">
                {t("securityPanel.question")} {index + 1}
              </h3>
              <Button
                onClick={() => {
                  alert(`open modal for question ${index + 1}`);
                }}
                theme="link"
                className="!px-2 text-sm"
              >
                {t("securityPanel.edit")}
              </Button>
            </div>
            <p className="mb-4 text-sm">{question.text}</p>
          </li>
        );
      })}
    </ul>
  );
};

const Profile: NextPageWithLayout<ProfileProps> = ({
  email,
  publishingStatus,
  userQuestions = [],
}: ProfileProps) => {
  const { t } = useTranslation(["profile"]);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
        <div>
          <main className="!ml-[90px] laptop:ml-60">
            <h1 className="mb-2 border-b-0 text-h1">{t("title")}</h1>
            <div className="flex flex-col gap-4 tablet:flex-row">
              <div className="w-full rounded-lg border p-4  laptop:w-1/2">
                <h2 className="mb-6 pb-0 text-base">{t("accountPanel.title")}</h2>
                <div>
                  <h3 className="mb-2 text-sm">{t("accountPanel.email")}</h3>
                  <p className="mb-4 text-sm">{email}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm">{t("accountPanel.publishing")}</h3>
                  <p className="mb-4 text-sm">
                    <Icon checked={publishingStatus} />{" "}
                    {publishingStatus ? t("accountPanel.unlocked") : t("accountPanel.locked")}
                  </p>
                </div>
              </div>
              <div className="w-full rounded-lg border p-4 laptop:w-1/2">
                <h2 className="mb-6 pb-0 text-base">{t("securityPanel.title")}</h2>
                <Questions questions={userQuestions} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

Profile.getLayout = (page: ReactElement) => {
  return <Template page={page}></Template>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, email }, locale }) => {
    {
      checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

      const publishingStatus = checkPrivilegesAsBoolean(ability, [
        { action: "update", subject: "FormRecord", field: "isPublished" },
      ]);

      // @todo pull from API
      const userQuestions = [
        { text: "Placeholder what was your favourite school subject?" },
        { text: "Placeholder what was the name of your first manager?" },
        { text: "Placeholder what was the make of your first car?" },
      ];

      return {
        props: {
          email,
          publishingStatus,
          userQuestions,
          ...(locale && (await serverSideTranslations(locale, ["profile", "common"]))),
        },
      };
    }
  }
);

export default Profile;
