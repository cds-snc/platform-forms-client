import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { getUser } from "@lib/users";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { getAllTemplatesForUser } from "@lib/templates";
import { LinkButton } from "@components/globals";

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
  [key: string]: string | boolean;
}>;

const ManageForms = ({ formUser, templates }: { formUser: User; templates: Templates }) => {
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
        } = template;
        return {
          id,
          titleEn,
          titleFr,
          isPublished,
        };
      });
    }

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, ["common", "admin-forms", "admin-login"]))),
        formUser: formUser,
        templates,
      },
    };
  }
);

export default ManageForms;
