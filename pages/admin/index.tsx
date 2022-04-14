import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import Link from "next/link";
import { User } from "next-auth";

type AdminWelcomeProps = {
  user: User;
};

const AdminWelcome: React.FC<AdminWelcomeProps> = (props: AdminWelcomeProps) => {
  const { t, i18n } = useTranslation("admin-login");
  const { user } = props;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div className="flex flex-wrap">
        <div className="flex-auto mb-10">
          <h3 className="gc-h3">
            {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
          </h3>
          {user.image && <img src={user.image} alt="profile" className="rounded-full" />}
          <p className="text-sm mb-8">
            {t("logged-in")} {user.email}
          </p>
        </div>

        <div className="flex-auto mb-10 w-60">
          <h3 className="gc-h3">Create Forms</h3>
          <p>
            <Link href="/admin/upload">Upload Form Templates</Link>
          </p>
        </div>
        <div className="flex-auto mb-10 w-60">
          <h3 className="gc-h3">View Existing Forms</h3>
          <p>
            <Link href="/admin/view-templates">View Form Templates</Link>
          </p>
          <p>
            <Link href="/admin/vault">View Form Submissions</Link>
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
