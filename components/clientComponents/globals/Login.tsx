"use client";
import { signIn } from "next-auth/react";
import { useTranslation } from "@i18n/client";

export const Login = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  return (
    <button
      onClick={async () =>
        signIn("zitadel", { callbackUrl: `http://localhost:3000/${language}/forms` })
      }
      className="border-0 bg-transparent text-blue-dark underline hover:text-blue-hover"
    >
      {t("loginMenu.login")}
    </button>
  );
};
