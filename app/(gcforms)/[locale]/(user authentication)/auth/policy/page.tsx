import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptableUseTerms } from "@clientComponents/auth/AcceptableUse";
import { requireAuthentication } from "@lib/auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("policy", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { user } = await requireAuthentication();

  if (user.acceptableUse) {
    redirect(`/${locale}/forms}`);
  }

  const termsOfUseContent = await require(`@public/static/content/${locale}/responsibilities.md`);

  return <AcceptableUseTerms content={termsOfUseContent} />;
}
