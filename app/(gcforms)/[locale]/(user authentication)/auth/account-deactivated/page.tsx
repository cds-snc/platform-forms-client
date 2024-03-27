import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LinkButton } from "@serverComponents/globals";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["deactivated"], { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation(["deactivated"], { lang: locale });
  const supportHref = `/${locale}/support`;
  return (
    <div>
      <h2 className="mt-4 mb-6 p-0">{t("title")}</h2>
      <p className="mb-10">{t("description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={supportHref} className="mb-2">
          {t("cta.label")}
        </LinkButton.Primary>
      </div>
    </div>
  );
}
