import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { PrimaryLinkButton } from "@clientComponents/globals";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("reset-password", { lang: locale });
  return {
    title: t("resetFailed.title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const continueHref = `/${locale}/`;
  const { t } = await serverTranslation("reset-password", { lang: locale });
  return (
    <div>
      <h2 className="mt-4 mb-6 p-0">{t("magicLink.title")}</h2>
      <p className="mb-10">{t("magicLink.description")}</p>
      <div className="laptop:flex">
        <PrimaryLinkButton href={continueHref} className="mb-2">
          {t("magicLink.cta.label")}
        </PrimaryLinkButton>
      </div>
    </div>
  );
}
