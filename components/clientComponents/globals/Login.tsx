"use client";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

export const Login = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  return (
    <Link href={`/${language}/auth/login`} prefetch={false}>
      {t("loginMenu.login")}
    </Link>
  );
};
