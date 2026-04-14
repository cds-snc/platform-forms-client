"use client";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { clearTemplateStore } from "@lib/store/utils";

export const LoginMenu = () => {
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    clearTemplateStore();

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeOptions = { timeZone: tz };
    const enTime = new Date().toLocaleString("en-CA", timeOptions);
    const frTime = new Date().toLocaleString("fr-CA", timeOptions);

    const logoutTime = JSON.stringify({
      en: enTime,
      fr: frTime,
    });

    sessionStorage.setItem("logoutTime", logoutTime);

    void signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };
  const session = useSession();

  return (
    <div
      id="login-menu"
      className="text-base font-normal not-italic"
      data-authenticated={`${session.status === "authenticated"}`}
    >
      {session.status === "authenticated" ? (
        <button
          type="button"
          className="text-blue-dark hover:text-blue-hover border-0 bg-transparent underline"
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
