import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import React from "react";

export const PublishNoAuth = () => {
  const { t, i18n } = useTranslation("form-builder");
  const signIn = <a href={`/${i18n.language}/auth/login`}>{t("signIn")}</a>;
  const createOne = <a href={`/${i18n.language}/auth/register`}>{t("createOne")}</a>;
  return (
    <>
      <h1 className="border-0 mb-2">{t("publishNoAuthTitle")}</h1>
      <h3 className="border-0 mb-5">{t("publishNoAuthSubTitle")}</h3>
      <p className="mb-0">
        <Markdown options={{ forceBlock: true }}>
          {t("publishNoAuthText", { signIn, createOne })}
        </Markdown>
      </p>
    </>
  );
};
