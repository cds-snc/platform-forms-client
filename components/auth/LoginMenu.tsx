import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { clearTemplateStore } from "@formbuilder/store";

const LoginMenu = () => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    clearTemplateStore();
    signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };

  return (
    <div id="login-menu" className="text-base font-normal not-italic">
      {isAuthenticated ? (
        <button
          type="button"
          className="border-0 bg-transparent text-blue-dark underline shadow-none hover:text-blue-hover"
          onClick={handleClick}
          lang={i18n.language}
        >
          {t("loginMenu.logout")}
        </button>
      ) : (
        <Link href={`/${i18n.language}/auth/login`}>{t("loginMenu.login")}</Link>
      )}
    </div>
  );
};

export default LoginMenu;
