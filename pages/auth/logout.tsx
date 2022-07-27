import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";

const Logout = () => {
  const { i18n, t } = useTranslation("logout");
  const { data: session } = useSession();

  return (
    <>
      <div>
        <h2 className="gc-h2">{t("messageContent")}</h2>
        <h4 className="pb-10">
          {t("lastLoginTime")} : {session?.user?.lastLoginTime}
        </h4>
        <div className="gc-go-to-login-btn">
          <Link data-testid="goToLogin" href={`/${i18n.language}/auth/login`}>
            {t("goToLoginLabel")}
          </Link>
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
