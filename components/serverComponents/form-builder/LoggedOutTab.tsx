import React from "react";
import { Card } from "@clientComponents/globals/card/Card";

import { serverTranslation } from "@i18n";
import Link from "next/link";

export enum LoggedOutTabName {
  PUBLISH = "publish",
  RESPONSES = "responses",
  SETTINGS = "settings",
}

interface LoggedOutTabProps {
  tabName: LoggedOutTabName;
}

export const LoggedOutTab = async ({ tabName }: LoggedOutTabProps) => {
  const { t, i18n } = await serverTranslation("form-builder");
  const signInLink = `/${i18n.language}/auth/login`;
  const createAccountLink = `/${i18n.language}/signup/register`;

  return (
    <Card
      icon={
        <picture>
          <img src="/img/cloud-lock.png" width="200" height="147" alt="" />
        </picture>
      }
    >
      <h1 className="gc-h2 text-[#748094]">{t(`loggedOutTab.${tabName}.title`)}</h1>
      <p className="mb-6">
        {t(`loggedOutTab.${tabName}.text1`)} <a href={signInLink}>{t("loggedOutTab.text2")}</a>.{" "}
        {t("loggedOutTab.text3")} <a href={createAccountLink}>{t("loggedOutTab.text4")}</a>.
      </p>
      <p>
        {/* @TODO: Switch these back out to linkButtons */}
        <Link href={signInLink} className="mr-4">
          {t("loggedOutTab.signinButton")}
        </Link>
        <Link href={createAccountLink}>{t("loggedOutTab.createButton")}</Link>
      </p>
    </Card>
  );
};
