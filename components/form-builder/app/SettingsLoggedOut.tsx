import React from "react";
import { Card } from "@components/globals/card/Card";
import { themes } from "./shared/Button";
import Link from "next/link";
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
        <Link href={signInLink} legacyBehavior>
          <a
            href={signInLink}
            className={`${themes.primary} ${themes.base} ${themes.htmlLink} mr-4`}
          >
            {t("settingsResponseDelivery.card.signinButton")}
          </a>
        </Link>
        <Link href={createAccountLink} legacyBehavior>
          <a
            href={createAccountLink}
            className={`text-black-default active:text-black-default visited:text-black-default ${themes.secondary} ${themes.base} no-underline active:shadow-none focus:shadow-none`}
          >
            {t("settingsResponseDelivery.card.createButton")}
          </a>
        </Link>
      </p>
    </Card>
  );
};
