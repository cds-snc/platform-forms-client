import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { signOut } from "next-auth/client";
import { User } from "next-auth";

type AdminNavProps = {
  user: User;
};

const AdminNav = (props: AdminNavProps): React.ReactElement => {
  const { i18n, t } = useTranslation("common");
  const user = props.user;

  return (
    <nav className="gc-admin">
      <ul className="gc-horizontal-list">
        <li className="gc-horizontal-item">
          <Link href="/admin/">{t("adminNav.dashboard")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/vault">{t("adminNav.vault")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/users">{t("adminNav.users")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/upload">{t("adminNav.upload")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/view-templates">{t("adminNav.templates")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/flags">{t("adminNav.features")}</Link>
        </li>
        <li className="gc-horizontal-item">
          {(!user || !user.name) && (
            <Link href="/admin/login" locale={i18n.language}>
              {t("adminNav.login")}
            </Link>
          )}
          {user && user.name && (
            <button className="gc-button-link" onClick={() => signOut()}>
              {t("adminNav.logout")}
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;
