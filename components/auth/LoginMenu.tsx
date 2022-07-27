import { signOut } from "next-auth/react";
import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const LoginMenu = ({ isAuthenticated, className }) => {
  const { i18n, t } = useTranslation("common");
  const handleClick = () => {
    signOut({ callbackUrl: "auth/logout" });
  };

  return (
    <>
      {isAuthenticated ? (
        <button onClick={handleClick} lang={i18n.language} className={className}>
          {t("loginMenu.logout")}
        </button>
      ) : (
        <div className={className}>
          <Link href={`/${i18n.language}/auth/login`}>{t("loginMenu.login")}</Link>
        </div>
      )}
    </>
  );
};

LoginMenu.propTypes = {
  isAuthenticated: PropTypes.bool,
  className: PropTypes.string,
};
LoginMenu.defaultProps = {
  isAuthenticated: false,
  className: "",
};

export default LoginMenu;
