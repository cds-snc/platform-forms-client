"use client";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { logout } from "../action";
import { useSessionCookie } from "@lib/hooks/auth/useSessionCookie";
import { clearTemplateStore } from "@lib/store/useTemplateStore";

export const LoginMenu = () => {
  const { i18n, t } = useTranslation("common");
  const handleClick = async () => {
    clearTemplateStore();
    await logout(i18n.language);
  };
  const authenticated = useSessionCookie();

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
