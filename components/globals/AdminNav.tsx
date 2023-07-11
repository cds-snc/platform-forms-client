import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { clearTemplateStore } from "@formbuilder/store";
import LanguageToggle from "./LanguageToggle";
import { SiteLogo } from "@formbuilder/icons";

type AdminNavProps = {
  user: User;
};

const AdminNav = (props: AdminNavProps): React.ReactElement => {
  const { i18n, t } = useTranslation(["common", "admin-login"]);
  const user = props.user;

  return (
    <div className="grid w-full grid-flow-col">
      <div className="flex">
        <Link href="/admin" legacyBehavior>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            id="logo"
            className="mr-5 flex border-r-1 pr-5 font-sans text-h2 font-bold !text-black no-underline !shadow-none focus:bg-white"
          >
            <div className="inline-block h-[45px] w-[46px] py-2">
              <SiteLogo title={t("title", { ns: "admin-login" })} />
            </div>
          </a>
        </Link>
        <div className="mt-3 box-border block h-[40px] px-2 py-1 text-base font-bold">
          {t("title", { ns: "admin-login" })}
        </div>
      </div>
      <nav className="justify-self-end">
        <>
          <ul className="mt-2 flex list-none px-0 text-base">
            {user && user.name && (
              <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
                {t("logged-in", { ns: "admin-login" })}: <span>{user.email}</span>
              </li>
            )}

            {user.name && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href="/admin">{t("adminNav.administration")}</Link>
              </li>
            )}

            {(!user || !user.name) && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href="/auth/login" locale={i18n.language}>
                  {t("adminNav.login")}
                </Link>
              </li>
            )}
            <li className="mr-2 py-2 text-base tablet:mr-4">
              <Link href="/myforms">{t("adminNav.myForms")}</Link>
            </li>
            {user && user.name && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <button
                  className="gc-button-link"
                  onClick={() => {
                    clearTemplateStore();
                    signOut();
                  }}
                >
                  {t("adminNav.logout")}
                </button>
              </li>
            )}
            <li className="mr-2 py-2 text-base tablet:mr-4">
              <LanguageToggle />
            </li>
          </ul>
        </>
      </nav>
    </div>
  );
};

export default AdminNav;
