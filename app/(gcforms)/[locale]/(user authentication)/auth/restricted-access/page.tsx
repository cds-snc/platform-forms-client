import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";
import { PrimaryLinkButton } from "@clientComponents/globals";
import Link from "next/link";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("restricted-access", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const continueHref = `/${locale}/`;
  const { t } = await serverTranslation("restricted-access", { lang: locale });
  return (
    <UserNavLayout contentWidth="tablet:w-[768px] laptop:w-[850px]">
      <div>
        <h2 className="mt-4 mb-6 p-0">{t("title")}</h2>
        <p className="mb-10">{t("text1")}</p>
        <p className="mb-10">
          {t("text2")} <Link href={`/${locale}/terms-of-use`}>{t("text3")}</Link> {t("text4")}
        </p>
        <div className="laptop:flex">
          <PrimaryLinkButton href={continueHref} className="mb-2">
            {t("cta.label")}
          </PrimaryLinkButton>
        </div>
      </div>
    </UserNavLayout>
  );
}
