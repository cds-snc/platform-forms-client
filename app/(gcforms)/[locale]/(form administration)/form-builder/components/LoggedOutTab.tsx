"use client";
import React from "react";
import { Card } from "@clientComponents/globals/card/Card";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useSessionCookie } from "@lib/hooks/auth/useSessionCookie";
import { useTranslation } from "@i18n/client";

export enum LoggedOutTabName {
  PUBLISH = "publish",
  RESPONSES = "responses",
  SETTINGS = "settings",
}

interface LoggedOutTabProps {
  tabName: LoggedOutTabName;
}

export const LoggedOutTab = ({ tabName }: LoggedOutTabProps) => {
  const authenticated = useSessionCookie();
  const { t, i18n } = useTranslation("form-builder");
  const signInLink = `/${i18n.language}/auth/login`;
  const createAccountLink = `/${i18n.language}/auth/register`;

  if (authenticated) {
    return null;
  }

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
        <LinkButton.Primary href={signInLink} className="mr-4">
          {t("loggedOutTab.signinButton")}
        </LinkButton.Primary>
        <LinkButton.Secondary href={createAccountLink}>
          {t("loggedOutTab.createButton")}
        </LinkButton.Secondary>
      </p>
    </Card>
  );
};
