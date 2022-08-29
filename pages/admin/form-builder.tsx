import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../components/form-builder/layout/Layout";
import { User } from "next-auth";
import { UserRole } from "@prisma/client";

type WelcomeProps = {
  user: User;
};

const Welcome: React.FC<WelcomeProps> = (props: WelcomeProps) => {
  const { t, i18n } = useTranslation("form-builder");
  const { user } = props;
  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div className="flex flex-wrap">
        <div className="flex-auto mb-10">
          <h3 className="gc-h3">
            {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
          </h3>
          <>
            <Layout />
          </>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "form-builder"]))),
    },
  };
}, UserRole.ADMINISTRATOR);

export default Welcome;
