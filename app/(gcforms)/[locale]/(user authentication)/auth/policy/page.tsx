import { Suspense } from "react";
import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptableUseTerms } from "./components/server/AcceptableUse";
import { authCheckAndRedirect } from "@lib/actions";
import Loading from "./components/server/Loading";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation("policy", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

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
