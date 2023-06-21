import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const ManageForms = ({ userId }: { userId: string }) => {
  const { t } = useTranslation("admin-forms");
  return (
    <>
      <Head>
        <title>{t("manageForms")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      {userId}
    </>
  );
};

ManageForms.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(
  async ({ locale, user: { ability }, params }) => {
    const { id } = params as { id: string };
    checkPrivileges(ability, [{ action: "view", subject: "Setting" }]);

    return {
      props: {
        ...(locale &&
          (await serverSideTranslations(locale, ["common", "admin-forms", "admin-login"]))),
        userId: id,
      },
    };
  }
);

export default ManageForms;
