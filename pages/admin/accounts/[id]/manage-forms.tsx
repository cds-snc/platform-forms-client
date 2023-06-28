import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { getUnprocessedSubmissionsForUser, getUser } from "@lib/users";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { getAllTemplatesForUser } from "@lib/templates";
import { LinkButton } from "@components/globals";
import { NagwareResult } from "@lib/types";
import { useSetting } from "@lib/hooks/useSetting";

type User = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type Templates = Array<{
  id: string;
  titleEn: string;
  titleFr: string;
  isPublished: boolean;
  createdAt: number | Date;
  [key: string]: string | boolean | number | Date;
}>;

type Overdue = { [key: string]: NagwareResult };

const OverdueStatus = ({ level }: { level: number }) => {
  const { value: promptAfter } = useSetting("nagwarePhasePrompted");
  const { value: warnAfter } = useSetting("nagwarePhaseWarned");
  const { t } = useTranslation("admin-forms");

  // 35 days +
  if ([3, 4].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">{t("overdueResponses", { days: warnAfter })}</span>
    );
  }
  // 21 days +
  if ([1, 2].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">
        {t("overdueResponses", { days: promptAfter })}
      </span>
    );
  }
};

const ManageForms = ({
  formUser,
  templates,
  overdue,
}: {
  formUser: User;
  templates: Templates;
  overdue: Overdue;
}) => {
  const { t, i18n } = useTranslation("admin-forms");
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h1 className="mb-10 border-0">
          {formUser && <span className="block">{`${formUser?.name} ${formUser?.email}`}</span>}
          {t("title")}
        </h1>
      </div>
      <ul className="m-0 list-none p-0">
        {templates.map(({ id, titleEn, titleFr, isPublished }) => {
          const bgColor = isPublished ? "#95CCA2" : "#FFD875";
          return (
            <li
              className="mb-4 flex max-w-2xl flex-row rounded-md border-2 border-black p-2"
              key={id}
            >
              <div className="m-auto grow basis-1/3 p-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-base">
                      {titleEn} / {titleFr}
                    </h2>

                    {overdue[id] && <OverdueStatus level={overdue[id].level} />}

                    {/* linking to existing page for now */}
                    <LinkButton.Secondary
                      href={`/${i18n.language}/id/${id}/users`}
                      className="mb-2 mr-3"
                    >
                      {t("manageOwnerships")}
                    </LinkButton.Secondary>
                    <LinkButton.Secondary
                      href={`/${i18n.language}/form-builder/responses/${id}`}
                      className="mb-2 mr-3"
                    >
                      {t("gotoResponses")}
                    </LinkButton.Secondary>
                  </div>
                  <div>
                    <span className="p-2" style={{ backgroundColor: bgColor }}>
                      {isPublished ? t("published") : t("draft")}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

ManageForms.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ locale, params, user: { ability } }) => {
    const id = params?.id || null;
    checkPrivileges(ability, [{ action: "view", subject: "Setting" }]);
    const formUser = await getUser(id as string, ability);

    let templates: Templates = [];
    if (id) {
      templates = (await getAllTemplatesForUser(ability, id as string)).map((template) => {
        const {
          id,
          form: { titleEn, titleFr },
          isPublished,
          createdAt,
        } = template;

        return {
          id,
          titleEn,
          titleFr,
          isPublished,
          createdAt: Number(createdAt),
        };
      });
    }

    const overdue = await getUnprocessedSubmissionsForUser(ability, id as string, templates);

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, ["common", "admin-forms", "admin-login"]))),
        formUser: formUser,
        templates,
        overdue,
      },
    };
  }
);

export default ManageForms;
