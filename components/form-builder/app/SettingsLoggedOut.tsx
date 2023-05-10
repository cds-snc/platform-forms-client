import React from "react";
import { Card } from "@components/globals/card/Card";
import { LinkButton } from "@components/globals";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

export const SettingsLoggedOut = () => {
  const { status } = useSession();
  const { t, i18n } = useTranslation("form-builder");
  const signInLink = `/${i18n.language}/auth/login`;
  const createAccountLink = `/${i18n.language}/signup/register`;

  if (status === "authenticated") {
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
      <p className="gc-h2 text-[#748094]">{t("settingsResponseDelivery.card.title")}</p>
      <p className="mb-6">
        {t("settingsResponseDelivery.card.text1")}{" "}
        <a href={signInLink}>{t("settingsResponseDelivery.card.text2")}</a>.{" "}
        {t("settingsResponseDelivery.card.text3")}{" "}
        <a href={createAccountLink}>{t("settingsResponseDelivery.card.text4")}</a>.
      </p>
      <p>
        <LinkButton.Primary href={signInLink} className="mr-4">
          {t("settingsResponseDelivery.card.signinButton")}
        </LinkButton.Primary>
        <LinkButton.Secondary href={createAccountLink}>
          {t("settingsResponseDelivery.card.createButton")}
        </LinkButton.Secondary>
      </p>
    </Card>
  );
};
