import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { signOut } from "next-auth/client";
import { AuthenticatedUser } from "../../lib/types";
import { requireAuthentication } from "../../lib/auth";
import { Button } from "../../components/forms";

type AdminWelcomeProps = {
  user: AuthenticatedUser;
};

const AdminWelcome: React.FC<AdminWelcomeProps> = (props: AdminWelcomeProps) => {
  const { t, i18n } = useTranslation("admin-login");
  const { user } = props;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div>
        <h2 className="gc-h2">
          {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
        </h2>
        {user.image ? <img src={user.image} alt="profile" /> : null}
        {t("logged-in")} {user.email} <br />
        <Button type="button" onClick={() => signOut()}>
          {t("button.logout")}
        </Button>
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  let pageProps = {};
  if (context.user) {
    pageProps = {
      user: { ...context.user },
      ...pageProps,
    };
  }

  if (context.locale) {
    pageProps = {
      ...(await serverSideTranslations(context.locale, ["common", "admin-login"])),
      ...pageProps,
    };
  }

  return { props: pageProps };
});

export default AdminWelcome;
