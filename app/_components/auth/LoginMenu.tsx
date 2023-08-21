"use client";
import { signOut, useSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { clearTemplateStore } from "@formbuilder/store";

const LoginMenu = () => {
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    clearTemplateStore();
    signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };

  const { status } = useSession();

  return (
    <>
      <div
        id="login-menu"
        className="text-base font-normal not-italic"
        data-authenticated={`${status === "authenticated"}`}
      >
        {status === "authenticated" ? (
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
    </>
  );
};

LoginMenu.propTypes = {
  isAuthenticated: PropTypes.bool,
};

export default LoginMenu;
