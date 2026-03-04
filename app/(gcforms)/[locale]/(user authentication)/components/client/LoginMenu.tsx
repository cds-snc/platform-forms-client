"use client";
import { useTranslation } from "@i18n/client";
import { signIn } from "next-auth/react";
import { logout } from "../action";
import { useSession } from "next-auth/react";
import { clearTemplateStore } from "@lib/store/utils";
import { Button } from "@clientComponents/globals";

export const LoginMenu = () => {
  const { i18n, t } = useTranslation("common");
  const handleClick = async () => {
    clearTemplateStore();
    await logout(i18n.language);
  };
  const session = useSession();

  return (
    <div
      id="login-menu"
      className="text-base font-normal not-italic"
      data-authenticated={`${session.status === "authenticated"}`}
    >
      {session.status === "authenticated" ? (
        <button
          type="button"
          className="border-0 bg-transparent text-blue-dark underline hover:text-blue-hover"
          onClick={handleClick}
          lang={i18n.language}
        >
          {t("loginMenu.logout")}
        </button>
      ) : (
        <form
          action={async () => {
            await signIn("gcForms", { redirectTo: `/${i18n.language}/auth/policy` });
          }}
        >
          <Button type="submit" theme="link" className="p-0">
            {t("loginMenu.login")}
          </Button>
        </form>
      )}
    </div>
  );
};
