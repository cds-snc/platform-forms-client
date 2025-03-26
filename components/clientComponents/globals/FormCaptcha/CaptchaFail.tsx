"use client";
import { useTranslation } from "@i18n/client";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";

// Future TODO: add pause-resume logic and support flow.

// Displayed when a suspicious user is dectected by Captcha.
export const CaptchaFail = () => {
  const { t } = useTranslation("captcha");
  return (
    <>
      <GcdsH1 tabIndex={-1}>{t("title")}</GcdsH1>
      <p>{t("helpOptions.title")}</p>
      <ul>
        <li>{t("helpOptions.item1")}</li>
        <li>{t("helpOptions.item2")}</li>
        <li>{t("helpOptions.item3")}</li>
      </ul>
    </>
  );
};
