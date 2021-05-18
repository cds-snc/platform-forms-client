import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { signOut } from "next-auth/client";
import { AuthenticatedUser } from "../../lib/types";
import { requireAuthentication } from "../../lib/auth";
import { Button } from "../../components/forms";
import Link from "next/link";

type AdminWelcomeProps = {
  user: AuthenticatedUser;
};

const AdminWelcome: React.FC<AdminWelcomeProps> = (props: AdminWelcomeProps) => {
  const { t, i18n } = useTranslation("admin-login");
  const { user } = props;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div className="grid grid-cols-3 md:grid-cols-1 gap-4 md:grid-flow-col">
        <div>
          <h3 className="gc-h3">
            {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
          </h3>
          {user.image ? <img src={user.image} alt="profile" className="rounded-full" /> : null}
          <p className="text-sm mb-8">
            {t("logged-in")} {user.email}
          </p>

          <Button type="button" onClick={() => signOut()}>
            {t("button.logout")}
          </Button>
        </div>

        <div className="w-60">
          <h3 className="gc-h3">Create Forms</h3>
          <p>
            <Link href="/admin/upload">View Form templates</Link>
          </p>
        </div>
        <div className="w-60">
          <h3 className="gc-h3">View Existing Forms</h3>
          <p>
            <Link href="/admin/view-templates">View Form templates</Link>
          </p>
          <p>
            <Link href="/admin/vault">View Form submissions</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-login"])),
      },
    };
  }
  return { props: {} };
});

export default AdminWelcome;
