import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";

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
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h2>{t("messageContent")}</h2>
        <div className="gc-last-logout-time">
          {t("logoutDate")} : {logoutDate}
        </div>
        <div className="gc-go-to-login-btn">
          <Link href={`/${i18n.language}/auth/login`}>{t("goToSignInLabel")}</Link>
        </div>
      </div>
    </>
  );
};

Logout.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "logout"]))),
    },
  };
};

export default Logout;
