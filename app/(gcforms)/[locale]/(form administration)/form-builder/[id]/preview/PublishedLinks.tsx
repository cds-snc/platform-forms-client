import { useTranslation } from "@i18n/client";

export const PublishedLinks = ({ id, locale }: { id: string; locale: string }) => {
  const { t } = useTranslation(["common", "form-builder"], { lng: locale });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Fallback for local development
  const linkEn = `${baseUrl}/en/id/${id}`;
  const linkFr = `${baseUrl}/fr/id/${id}`;

  return (
    <div>
      <p className="mb-2 mt-5">{t("publishedViewLinks", { ns: "form-builder" })}</p>
      <p>
        <strong>{t("english")}</strong> <a href={linkEn}>{linkEn}</a>
      </p>
      <p>
        <strong>{t("french")}</strong> <a href={linkFr}>{linkFr}</a>
      </p>
    </div>
  );
};
