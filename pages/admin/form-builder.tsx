import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../components/form-builder/layout/Layout";
import { User } from "next-auth";
import { createAbility } from "@lib/policyBuilder";

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

export const getServerSideProps = requireAuthentication(async ({ user, locale }) => {
  const userAbility = user?.privileges && createAbility(user.privileges);
  if (userAbility?.cannot("update", "FormRecord")) {
    return {
      redirect: {
        destination: `/${locale}/admin/unauthorized/`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
    },
  };
});

export default Welcome;
