import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

const Logout = () => {
  const { i18n, t } = useTranslation("logout");
  const [logoutDate, setLogoutDate] = useState("");

  useEffect(() => {
    setLogoutDate(
      new Date().toLocaleString(`${i18n.language + "-CA"}`, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    );
  }, []);

  return (
    <>
      <div>
        <h2>{t("messageContent")}</h2>
        <div className="gc-last-logout-time">
          {t("logoutDate")} : {logoutDate}
        </div>
        <div className="gc-go-to-login-btn">
          <Link href={`/${i18n.language}/login`}>{t("goToLoginLabel")}</Link>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "logout"]))),
    },
  };
};

export default Logout;
