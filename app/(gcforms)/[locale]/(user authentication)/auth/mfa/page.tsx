import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { MFAForm } from "./components/client/MFAForm";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { SearchParams } from "@lib/types";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["auth-verify"], { lang: locale });
  return {
    title: t("verify.title"),
  };
}

export default async function Page({
  params: { locale },
  searchParams: { user, token },
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (session) {
    redirect(`/${locale}/forms`);
  }

  // If the data is not as we expect it to be, redirect to the login page
  // if (!user || !token || Array.isArray(user) || Array.isArray(token)) {
  //   redirect(`/${locale}/auth/login`);
  // }

  return <MFAForm username={user as string} authenticationFlowToken={token as string} />;
}
