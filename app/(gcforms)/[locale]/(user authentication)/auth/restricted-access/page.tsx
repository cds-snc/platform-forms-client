import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import Link from "next/link";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("restricted-access", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const continueHref = `/${locale}/auth/policy`;
  const { t } = await serverTranslation("restricted-access", { lang: locale });
  return (
    <div>
      <h2 className="mb-6 mt-4 p-0">{t("title")}</h2>
      <p className="mb-10">{t("text1")}</p>
      <p className="mb-10">
        {t("text2")} <Link href={`/${locale}/terms-of-use`}>{t("text3")}</Link> {t("text4")}
      </p>
      <div className="laptop:flex">
        <LinkButton.Primary href={continueHref} className="mb-2">
          {t("cta.label")}
        </LinkButton.Primary>
      </div>
    </div>
  );
}
