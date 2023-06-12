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
    <div className="grid grid-flow-col w-full">
      <div className="flex">
        <Link href="/admin" legacyBehavior>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            id="logo"
            className="border-r-1 flex pr-5 mr-5 text-h2 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none"
          >
            <div className="inline-block w-[46px] h-[45px] py-2">
              <SiteLogo title={t("title")} />
            </div>
          </a>
        </Link>
        <div className="px-2 py-1 box-border block mt-3 h-[40px] text-base font-bold">
          {t("title", { ns: "common" })}
        </div>
      </div>
      <nav className="justify-self-end">
        <>
          <ul className="mt-2 px-0 flex text-base list-none">
            {user && user.name && (
              <li className="mr-2 tablet:mr-4 py-2 text-sm pt-3">
                {t("logged-in", { ns: "admin-login" })}: <span>{user.email}</span>
              </li>
            )}

            {(!user || !user.name) && (
              <li className="text-base mr-2 tablet:mr-4 py-2">
                <Link href="/auth/login" locale={i18n.language}>
                  {t("adminNav.login")}
                </Link>
              </li>
            )}
            <li className="text-base mr-2 tablet:mr-4 py-2">
              <Link href="/myforms">{t("adminNav.myForms")}</Link>
            </li>
            {user && user.name && (
              <li className="text-base mr-2 tablet:mr-4 py-2">
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
            <li className="text-base mr-2 tablet:mr-4 py-2">
              <LanguageToggle />
            </li>
          </ul>
        </>
      </nav>
    </div>
  );
};

export default AdminNav;
