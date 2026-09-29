"use client";
import { useTranslation } from "@i18n/client";

// Future TODO: add pause-resume logic and support flow.

// Displayed when a suspicious user is dectected by Captcha.
export const CaptchaFail = () => {
  const { t } = useTranslation("captcha");
  return (
    <>
      <h2>{t("title")}</h2>
      <p className="mb-4">{t("helpOptions.title")}</p>
      <ul className="mb-4">
        <li>{t("helpOptions.item1")}</li>
        <li>{t("helpOptions.item2")}</li>
        <li>{t("helpOptions.item3")}</li>
      </ul>
      <p>{t("helpOptions.tryAgain")}</p>
    </>
  );
};
