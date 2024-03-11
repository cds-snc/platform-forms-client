"use client";
import { signOut } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { clearTemplateStore } from "@lib/store";

export const LoginMenu = ({ authenticated }: { authenticated: boolean }) => {
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    clearTemplateStore();
    signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };

  return (
    <div
      id="login-menu"
      className="text-base font-normal not-italic"
      data-authenticated={`${authenticated}`}
    >
      {authenticated ? (
        <button
          type="button"
          className="border-0 bg-transparent text-blue-dark underline hover:text-blue-hover"
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
