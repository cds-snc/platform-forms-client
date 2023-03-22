import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { useAccessControl } from "@lib/hooks";
import { clearTemplateStore } from "@formbuilder/store";

type AdminNavProps = {
  user: User;
};

const AdminNav = (props: AdminNavProps): React.ReactElement => {
  const { i18n, t } = useTranslation("common");
  const user = props.user;

  const { ability } = useAccessControl();

  return (
    <nav className="border-t-1 border-b-1 mb-20 py-5">
      <ul className="lg:flex-col lg:text-small_base p-0 mb-0 flex text-base list-none">
        <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
          <Link href="/admin/">{t("adminNav.dashboard")}</Link>
        </li>
        {ability?.can("view", "User") && (
          <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
            <Link href="/admin/users">{t("adminNav.users")}</Link>
          </li>
        )}
        {ability?.can("view", "Privilege") && (
          <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
            <Link href="/admin/privileges">{t("adminNav.privileges")}</Link>
          </li>
        )}
        {ability?.can("create", "FormRecord") && (
          <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
            <Link href="/admin/upload">{t("adminNav.upload")}</Link>
          </li>
        )}
        {ability?.can("view", "Flag") && (
          <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
            <Link href="/admin/flags">{t("adminNav.features")}</Link>
          </li>
        )}

        {ability?.can("view", "Flag") && (
          <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
            <Link href="/admin/settings">{t("adminNav.settings")}</Link>
          </li>
        )}

        <li className="lg:pr-0 lg:pb-4 pr-8 pb-0">
          {(!user || !user.name) && (
            <Link href="/admin/login" locale={i18n.language}>
              {t("adminNav.login")}
            </Link>
          )}
          {user && user.name && (
            <button
              className="gc-button-link"
              onClick={() => {
                clearTemplateStore();
                signOut();
              }}
            >
              {t("adminNav.logout")}
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;
