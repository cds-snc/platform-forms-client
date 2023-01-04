import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import React from "react";

export const PublishNoAuth = () => {
  const { t, i18n } = useTranslation("form-builder");
  const signIn = `/${i18n.language}/auth/login`;
  const createOne = `/${i18n.language}/signup/register`;
  return (
    <>
      <h1 className="border-0 mb-2 md:text-h1">{t("publishNoAuthTitle")}</h1>
      <h3 className="border-0 mb-5">{t("publishNoAuthSubTitle")}</h3>
      <div className="mb-0">
        <Markdown options={{ forceBlock: true }}>
          {t("publishNoAuthText", { signIn, createOne })}
        </Markdown>
      </div>
    </>
  );
};
