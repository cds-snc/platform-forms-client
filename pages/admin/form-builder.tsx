import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../components/form-builder/layout/Layout";
import { User } from "next-auth";
import { UserRole } from "@prisma/client";

type WelcomeProps = {
  user: User;
};

const Welcome: React.FC<WelcomeProps> = () => {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="flex-auto mb-10">
          <Layout />
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
