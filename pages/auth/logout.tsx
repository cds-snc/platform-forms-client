import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import { LinkButton } from "@components/globals";

const Logout = () => {
  const { i18n, t } = useTranslation("logout");
  const [logoutDate, setLogoutDate] = useState("");

  useEffect(() => {
    setLogoutDate(
      new Date().toLocaleString(`${i18n.language + "-CA"}`, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    );
    // @todo - fix this eslint error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <div>
        <h1 className="mb-12 mt-6 border-b-0">{t("messageContent")}</h1>
        <div className="items-center pb-10 pt-3 text-sm font-normal not-italic">
          {t("logoutDate")} : {logoutDate}
        </div>
        <div>
          <LinkButton.Primary href={`/${i18n.language}/auth/login`}>
            {t("goToSignInLabel")}
          </LinkButton.Primary>
        </div>
      </div>
    </>
  );
};

Logout.getLayout = (page: ReactElement) => {
  return <UserNavLayout contentWidth="tablet:w-[658px]">{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "logout"]))),
    },
  };
};

export default Logout;
