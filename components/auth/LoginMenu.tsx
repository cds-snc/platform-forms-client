import { signOut } from "next-auth/react";
import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import Link from "next/link";

type LoginMenuProp = {
  isAuthenticated: boolean;
};

const LoginMenu = ({ isAuthenticated }: LoginMenuProp) => {
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    signOut({ callbackUrl: "auth/logout" });
  };

  return (
    <>
      <div className="gc-login-menu">
        {isAuthenticated ? (
          <button onClick={handleClick} lang={i18n.language}>
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
