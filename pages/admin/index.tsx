import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import Link from "next/link";
import Head from "next/head";
import { User } from "next-auth";
import { NextPageWithLayout } from "@pages/_app";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

type AdminWelcomeProps = {
  user: User;
};

const AdminWelcome: NextPageWithLayout<AdminWelcomeProps> = (props: AdminWelcomeProps) => {
  const { t, i18n } = useTranslation("admin-login");
  const { user } = props;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div className="flex flex-wrap">
        <div className="flex-auto mb-10">
          <h3>
            {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
          </h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {user.image && (
            <picture>
              <img src={user.image} alt="profile" className="rounded-full" />
            </picture>
          )}
          <p className="text-sm mb-8">
            {t("logged-in")} {user.email}
          </p>
        </div>

        <div className="flex-auto mb-10 w-60">
          <h3>Create Forms</h3>
          <p>
            <Link href="/myforms">GC Forms</Link>
          </p>
          <p>
            <Link href="/admin/upload">Upload Form Templates</Link>
          </p>
        </div>
        <div className="flex-auto mb-10 w-60">
          <h3>View Existing Forms</h3>
          <p>
            <Link href="/admin/view-templates">View Form Templates</Link>
          </p>
          <p>
            <Link href="/admin/vault">View Form Submissions</Link>
          </p>
        </div>
      </div>
    </>
  );
};
AdminWelcome.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};
export const getServerSideProps = requireAuthentication(async ({ locale }) => {
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-login"]))),
    },
  };
});

export default AdminWelcome;
