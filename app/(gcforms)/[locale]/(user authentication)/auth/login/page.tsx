import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LoginForm } from "./components/client/LoginForm";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["login"], { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (session) {
    redirect(`/${locale}/forms`);
  }

  return <LoginForm />;
}
