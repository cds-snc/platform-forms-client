import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { countPublishedTemplates, countUnpublishedTemplates } from "@lib/templates";

const Upload = ({
  publishedTemplates,
  unpublishedTemplates,
}: {
  publishedTemplates: number;
  unpublishedTemplates: number;
}): React.ReactElement => {
  const { t } = useTranslation("admin-stats");
  return (
    <>
      <Head>
        <title>{t("stats.title")}</title>
      </Head>
      <h1>{t("stats.title")}</h1>
      <div>
        {t("publishedForms")}: {publishedTemplates}
      </div>
      <div>
        {t("unpublishedForms")}: {unpublishedTemplates}
      </div>
    </>
  );
};

Upload.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ locale, user: { ability, id: userID } }) => {
    checkPrivileges(
      ability,
      [
        { action: "view", subject: "FormRecord" },
        { action: "update", subject: "FormRecord" },
      ],
      "one"
    );
    const publishedTemplates = await countPublishedTemplates(ability, userID);
    const unpublishedTemplates = await countUnpublishedTemplates(ability, userID);

    return {
      props: {
        ...(locale && (await serverSideTranslations(locale, ["common", "admin-stats"]))),
        publishedTemplates,
        unpublishedTemplates,
      },
    };
  }
);

export default Upload;
