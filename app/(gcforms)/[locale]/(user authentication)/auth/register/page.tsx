import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { RegistrationForm } from "./components/client/RegistrationForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("signup", { lang: locale });
  return {
    title: t("signUpRegistration.title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();

  if (session) redirect(`/${locale}/forms/`);

  return <RegistrationForm />;
}
