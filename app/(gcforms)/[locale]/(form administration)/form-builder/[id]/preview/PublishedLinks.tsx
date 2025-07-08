import { useTranslation } from "@i18n/client";
import { getHost } from "@lib/utils/form-builder";

export const PublishedLinks = ({ id, locale }: { id: string; locale: string }) => {
  const { t } = useTranslation(["form-builder"], { lng: locale });

  const linkEn = `${getHost()}/en/id/${id}`;
  const linkFr = `${getHost()}/fr/id/${id}`;

  return (
    <div>
      <p className="mb-2 mt-5">{t("publishedViewLinks", { ns: "form-builder" })}</p>
      <div className="grid grid-cols-[max-content_1fr] gap-x-2">
        <strong>{t("english")}</strong>
        <a href={linkEn}>{linkEn}</a>
        <strong>{t("french")}</strong>
        <a href={linkFr}>{linkFr}</a>
      </div>
    </div>
  );
};
