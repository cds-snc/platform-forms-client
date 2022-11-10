import { useTranslation } from "next-i18next";
import React from "react";
import Link from "next/link";

export const PublishNoAuth = () => {
  const { t, i18n } = useTranslation("form-builder");
  const signIn = <Link href={`/${i18n.language}/auth/login`}>{t("signIn")}</Link>;
  const createOne = <Link href={`/${i18n.language}/auth/register`}>{t("createOne")}</Link>;
  return (
    <>
      <h1 className="border-0 mb-2">{t("publishNoAuthTitle")}</h1>
      <h3 className="border-0 mb-5">{t("publishNoAuthSubTitle")}</h3>
      {i18n.language === "en" ? (
        <p className="mb-0">
          To publish your form, {signIn} to your GC Forms account. If you do not have a GC Forms
          account, {createOne}
        </p>
      ) : (
        <p className="mb-0">
          FR To publish your form, {signIn} to your GC Forms account. If you do not have a GC Forms
          account, {createOne}
        </p>
      )}
    </>
  );
};
