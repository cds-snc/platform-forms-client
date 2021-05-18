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
      <div className="grid grid-cols-3 gap-4">
        <div className="w-60">
          <h3 className="gc-h3">
            {i18n.language === "en" ? "Welcome" : "Bienvenue"} {user.name}!
          </h3>
          {user.image ? <img src={user.image} alt="profile" className="rounded-full" /> : null}
          <p className="text-sm">
            {t("logged-in")} {user.email}
          </p>
          <Button type="button" onClick={() => signOut()}>
            {t("button.logout")}
          </Button>
        </div>

        <div className="w-60">
          <h3 className="gc-h3">Create a new Form</h3>
          <p></p>
        </div>
        <div className="w-60">
          <h3 className="gc-h3">View your Forms</h3>
          <p></p>
        </div>
      </div>
    </>
  );
};

/*
<div class="shadow-lg rounded-xl flex-none w-80 md:w-xl"><p>If I had to recommend a way of getting into programming today, it would be HTML + CSS with Tailwind CSS.</p><figcaption class="flex items-center space-x-4 p-6 md:px-10 md:py-6 bg-gradient-to-br rounded-b-xl leading-6 font-semibold text-white from-fuchsia-500 to-purple-600"><div class="flex-none w-14 h-14 bg-white rounded-full flex items-center justify-center"><img src="/_next/static/media/guillermo-rauch.f9555769f9ff1d42057c689278bc0876.jpg" alt="" class="w-12 h-12 rounded-full bg-fuchsia-100" loading="lazy"></div><div class="flex-auto">Guillermo Rauch<br><span class="text-fuchsia-100">Vercel</span></div><cite class="flex"><a href="https://twitter.com/rauchg/status/1225611926320738304" class="opacity-50 hover:opacity-75 transition-opacity duration-200"><span class="sr-only">Original tweet by Guillermo Rauch</span></a></cite></figcaption></div>
*/

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
