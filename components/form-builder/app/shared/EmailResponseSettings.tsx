import React from "react";
import { useTranslation } from "next-i18next";

export const EmailResponseSettings = ({
  emailAddress,
  subjectEn,
  subjectFr,
}: {
  emailAddress: string;
  subjectEn: string;
  subjectFr: string;
}) => {
  const { t, i18n } = useTranslation("form-builder-responses");

  return (
    <div>
      <p>{t("responses.email.submitTo")}</p>
      <p className="mb-10">{emailAddress}</p>
      <p>{t("responses.email.subjectLine")}</p>
      <p>{i18n.language === "en" ? subjectEn : subjectFr}</p>
    </div>
  );
};
