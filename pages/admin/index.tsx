import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { requireAuthentication } from "@lib/auth";
import { NextPageWithLayout } from "@pages/_app";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { ManageAccountsIcon, SettingsApplicationsIcon } from "@components/form-builder/icons";

// keeping this here if we want to add a welcome page
const AdminWelcome: NextPageWithLayout = () => {
  const { t } = useTranslation(["admin-home"]);

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="rounded-lg border bg-white p-10">
          <h2>
            <ManageAccountsIcon className="inline-block h-14 w-14" /> {t("accountAdministration")}
          </h2>
          <p>{t("manageUsersAndTheirForms")}</p>
          <p>
            <Link href="/admin/accounts" legacyBehavior>
              <a href={"/admin/accounts"}>{t("accounts")}</a>
            </Link>
          </p>
        </div>

        <div className="ml-20 rounded-lg border bg-white p-10">
          <h2>
            <SettingsApplicationsIcon className="inline-block h-14 w-14" />
            {t("systemAdministration")}
          </h2>
          <p>{t("configureHowTheApplicationWorks")}</p>
          <ul className="list-none pl-0">
            <li>
              <Link href="/admin/settings" legacyBehavior>
                <a href={"/admin/settings"}>{t("systemSettings")}</a>
              </Link>
            </li>
            <li>
              <Link href="/admin/flags" legacyBehavior>
                <a href={"/admin/flags"}>{t("featureFlags")}</a>
              </Link>
            </li>
            <li>
              <Link href="/admin/privileges" legacyBehavior>
                <a href={"/admin/privileges"}>{t("permissions")}</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
AdminWelcome.getLayout = (page: ReactElement) => {
  return (
    <AdminNavLayout user={page.props.user} hideLeftNav={true}>
      {page}
    </AdminNavLayout>
  );
};
export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  const canViewUsers = checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "User" }]);
  if (!canViewUsers) {
    return {
      redirect: {
        destination: `/myforms`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "admin-home", "admin-login"]))),
    },
  };
});

export default AdminWelcome;
