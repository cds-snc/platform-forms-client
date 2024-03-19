import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptableUseTerms } from "app/(gcforms)/[locale]/(user authentication)/auth/policy/AcceptableUse";
import { auth } from "@lib/auth";

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
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }
  // If already accepted redirect to forms
  if (session.user.acceptableUse) {
    redirect(`/${locale}/forms`);
  }

  const termsOfUseContent = await require(`@public/static/content/${locale}/responsibilities.md`);

  return <AcceptableUseTerms content={termsOfUseContent} />;
}
