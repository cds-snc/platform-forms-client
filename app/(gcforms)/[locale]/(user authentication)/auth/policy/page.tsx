import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptableUseTerms } from "./components/server/AcceptableUse";
import { authCheckAndRedirect } from "@lib/actions";
import Loading from "./components/server/Loading";

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
  const { session } = await authCheckAndRedirect();

  // If already accepted redirect to forms
  if (session.user.acceptableUse) {
    redirect(`/${locale}/forms`);
  }

  return (
    <Suspense fallback={<Loading />}>
      <AcceptableUseTerms locale={locale} />
    </Suspense>
  );
}
