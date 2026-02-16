"use client";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import Loader from "@clientComponents/globals/Loader";

export const Login = ({ language = "en" }) => {
  const { data, status } = useSession();
  const { t } = useTranslation("common");

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "authenticated") {
    return <div>{`Hello ${data.user?.name}`}</div>;
  }
  return (
    <div>
      <h1 className="mb-12 mt-6 border-b-0">{t("loginPilot.title")}</h1>
      <p className="-mt-6 mb-10">{t("loginPilot.description")}</p>
      <form
        action={async () => {
          signIn("gcForms", { redirectTo: `/${language}/auth/policy` });
        }}
      >
        <Button type="submit">{t("loginPilot.button")}</Button>
      </form>
    </div>
  );
};
