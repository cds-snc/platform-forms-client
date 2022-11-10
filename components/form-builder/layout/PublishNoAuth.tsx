import { useTranslation } from "next-i18next";
import React from "react";
import Link from "next/link";

export const PublishNoAuth = () => {
  const { t, i18n } = useTranslation("form-builder");
  const signIn = <Link href={`/${i18n.language}/auth/login`}>{t("signIn")}</Link>;
  const createIn = <Link href={`/${i18n.language}/auth/login`}>{t("createOne")}</Link>;
  return (
    <>
      <h1 className="border-0 mb-2">{t("publishNoAuthTitle")}</h1>
      <h3 className="border-0 mb-5">{t("publishNoAuthSubTitle")}</h3>
      <p className="mb-0">
        {t("publishNoAuthInstructions", { sign_in: signIn, create_one: createIn })}
      </p>
    </>
  );
};
