import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { signIn, signOut, useSession } from "next-auth/client";
import { Button } from "../../components/forms";

const Page = () => {
  const { t } = useTranslation("admin-login");
  const [session] = useSession();

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div>
        {!session && (
          <Button type="button" onClick={() => signIn()}>
            {t("button.login")}
          </Button>
        )}
        {session && (
          <>
            <h2 className="gc-h2">Welcome {session.user.name}!</h2>
            <img src={session.user.image} alt="profile" />
            {t("logged-in")} {session.user.email} <br />
            <Button type="button" onClick={() => signOut()}>
              {t("button.logout")}
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "admin-login"])),
  },
});

export default Page;
