import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ReVerify } from "./components/client/ReVerify";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["auth-verify"], { lang: locale });
  return {
    title: t("reVerify.title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const session = await auth();
  if (session) {
    redirect(`/${locale}/forms`);
  }

  const authFlowCookie = cookies().get("authenticationFlow");
  if (!authFlowCookie) {
    redirect(`/${locale}/auth/login`);
  }
  const { email, authenticationFlowToken }: Record<string, string> = JSON.parse(
    authFlowCookie.value
  );

  return <ReVerify email={email} authenticationFlowToken={authenticationFlowToken} />;
}
