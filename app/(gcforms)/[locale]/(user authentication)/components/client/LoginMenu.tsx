"use client";
import { useTranslation } from "@i18n/client";

import { useSession } from "next-auth/react";
import { clearTemplateStore } from "@lib/store/utils";
import { Login } from "@clientComponents/globals/Login";
import { useRouter } from "next/navigation";

export const LoginMenu = () => {
  const { i18n, t } = useTranslation("common");
  const router = useRouter();
  const handleClick = async () => {
    clearTemplateStore();
    router.push(`/${i18n.language}/auth/logout`);
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
        <Login />
      )}
    </div>
  );
};
