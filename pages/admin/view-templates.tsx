import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getAllTemplates } from "@lib/templates";
import { requireAuthentication } from "@lib/auth";
import { getProperty } from "@lib/formBuilder";

import React, { Fragment } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { UserRole } from "@prisma/client";

interface DataViewProps {
  templates: Array<{
    id: string;
    titleEn: string;
    titleFr: string;
    publishingStatus: boolean;
    [key: string]: string | boolean;
  }>;
}

const DataView = (props: DataViewProps): React.ReactElement => {
  const { t, i18n } = useTranslation("admin-templates");
  const { templates } = props;
  const router = useRouter();

  const redirectToSettings = (formID: string) => {
    router.push({
      pathname: `/${i18n.language}/id/${formID}/settings`,
    });
  };
  const redirectToForm = (formID: string) => {
    router.push({
      pathname: `/${i18n.language}/id/${formID}`,
    });
  };

  return (
    <>
      <Head>
        <title>{t("view.title")}</title>
      </Head>

      <h1>{t("view.title")}</h1>
      <table className="w-full table-auto  border border-4 border-gray-400">
        <thead className="border border-4 border-gray-400">
          <tr>
            <th>{t("view.formTitle")}</th>
            <th>{t("view.status")}</th>
            <th className="w-1/12">{t("view.update")}</th>
            <th className="w-1/12">{t("view.view")}</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            return (
              <tr key={template.id} className="border-t-4 border-b-1 border-gray-400">
                <td className="pl-4">{template[getProperty("title", i18n.language)]} </td>
                <td className="text-center">
                  {template.publishingStatus ? t("view.published") : t("view.draft")}
                </td>
                <td>
                  <button
                    onClick={() => redirectToSettings(template.id)}
                    className="gc-button w-full"
                  >
                    {t("view.update")}
                  </button>
                </td>
                <td>
                  <button onClick={() => redirectToForm(template.id)} className="gc-button w-full">
                    {t("view.view")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  {
    // getStaticProps is serverside, and therefore instead of doing a request,
    // we import the invoke Lambda function directly

    const templates = (await getAllTemplates()).map((template) => {
      const {
        id,
        form: { titleEn, titleFr },
        publishingStatus,
      } = template;
      return {
        id,
        titleEn,
        titleFr,
        publishingStatus,
      };
    });

    return {
      props: {
        templates,
        ...(context.locale &&
          (await serverSideTranslations(context.locale, ["common", "admin-templates"]))),
      }, // will be passed to the page component as props
    };

    return { props: {} };
  }
}, UserRole.ADMINISTRATOR);

export default DataView;
