import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { signOut } from "next-auth/client";
import { AuthenticatedUser } from "../../lib/types";

type AdminNavProps = {
  user: AuthenticatedUser;
};

const AdminNav = (props: AdminNavProps): React.ReactElement => {
  const { i18n } = useTranslation("admin-login");
  const user = props.user;

  return (
    <nav className="gc-admin">
      <ul className="gc-horizontal-list">
        <li className="gc-horizontal-item">
          <Link href="/admin/">Dashboard</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/vault">Form Vault</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/upload">Upload Form</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/view-templates">Form templates</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="/admin/flags">Feature Settings</Link>
        </li>
        <li className="gc-horizontal-item">
          {(!user || !user.name) && (
            <Link href="/admin/login" locale={i18n.language}>
              Login
            </Link>
          )}
          {user && user.name && (
            <button className="gc-button-link" onClick={() => signOut()}>
              Logout
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;
