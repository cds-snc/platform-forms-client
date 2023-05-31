import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { getProperty } from "@lib/formBuilder";

import React, { Fragment, ReactElement } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { checkPrivileges } from "@lib/privileges";
import { useAccessControl, useRefresh } from "@lib/hooks";
import axios from "axios";
import { logMessage } from "@lib/logger";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

interface DataViewProps {
  templates: Array<{
    id: string;
    titleEn: string;
    titleFr: string;
    isPublished: boolean;
    [key: string]: string | boolean;
  }>;
}

enum WhereToRedirect {
  Form,
  Settings,
  Users,
}

const handlePublish = async (formID: string, isPublished: boolean) => {
  return await axios({
    url: `/api/templates/${formID}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    data: { isPublished },
    timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
  }).catch((err) => logMessage.error(err));
};

const DataView = (props: DataViewProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { templates } = props;
  const router = useRouter();
  const { refreshData } = useRefresh();

  const redirectTo = async (where: WhereToRedirect, formID: string) => {
    let pathname = "";
    switch (where) {
      case WhereToRedirect.Form:
        pathname = `/${i18n.language}/id/${formID}`;
        break;
      case WhereToRedirect.Settings:
        pathname = `/${i18n.language}/id/${formID}/settings`;
        break;
      case WhereToRedirect.Users:
        pathname = `/${i18n.language}/id/${formID}/users`;
        break;
    }
    await router.push({
      pathname: pathname,
    });
  };

  const { ability } = useAccessControl();

  return (
    <>
      <Head>
        <title>{t("view.title")}</title>
      </Head>

      <h1 className="border-0 mb-0">{t("view.title")}</h1>
      <table className="w-full table-auto  border border-4 border-gray-400">
        <thead className="border border-4 border-gray-400">
          <tr>
            <th>{t("view.formTitle")}</th>
            <th>{t("view.status")}</th>
            <th className="w-1/12">{t("view.update")}</th>
            <th className="w-1/12">{t("view.view")}</th>
            <th className="w-1/12">{t("view.users")}</th>
            <th className="w-1/12">{t("view.publishForm")}</th>
          </tr>
        </thead>
        <tbody>
          {templates
            .sort((a, b) => {
              return (a[getProperty("title", i18n.language)] as string).localeCompare(
                b[getProperty("title", i18n.language)] as string
              );
            })
            .map((template) => {
              return (
                <tr key={template.id} className="border-t-4 border-b-1 border-gray-400">
                  <td className="pl-4">{template[getProperty("title", i18n.language)]} </td>
                  <td className="text-center">
                    {template.isPublished ? t("view.published") : t("view.draft")}
                  </td>
                  <td>
                    {ability?.can("update", "FormRecord") && (
                      <button
                        onClick={async () =>
                          await redirectTo(WhereToRedirect.Settings, template.id)
                        }
                        className="gc-button w-full"
                      >
                        {t("view.update")}
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={async () => await redirectTo(WhereToRedirect.Form, template.id)}
                      className="gc-button w-full"
                    >
                      {t("view.view")}
                    </button>
                  </td>
                  {ability?.can("update", "FormRecord") && (
                    <td>
                      <button
                        onClick={async () => await redirectTo(WhereToRedirect.Users, template.id)}
                        className="gc-button w-full"
                      >
                        {t("view.assign")}
                      </button>
                    </td>
                  )}
                  {ability?.can("update", "FormRecord", "isPublished") && (
                    <td>
                      <button
                        onClick={async () => {
                          await handlePublish(template.id, !template.isPublished);
                          refreshData();
                        }}
                        className="gc-button w-full"
                      >
                        {template.isPublished ? t("view.unpublishForm") : t("view.publishForm")}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};

DataView.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ user: { ability, id }, locale }) => {
    {
      checkPrivileges(
        ability,
        [
          { action: "view", subject: "FormRecord" },
          { action: "update", subject: "FormRecord" },
        ],
        "one"
      );
      // getStaticProps is serverside, and therefore instead of doing a request,
      // we import the invoke Lambda function directly

      const templates = (await getAllTemplates(ability, id)).map((template) => {
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

      return {
        props: {
          templates,
          ...(locale &&
            (await serverSideTranslations(locale, ["common", "admin-templates", "admin-login"]))),
        }, // will be passed to the page component as props
      };

      return { props: {} };
    }
  }
);

export default DataView;
