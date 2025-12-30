import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { MFAForm } from "./components/client/MFAForm";
import { redirect } from "next/navigation";
import { authCheckAndThrow } from "@lib/actions";
import { cookies } from "next/headers";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["auth-verify"], { lang: locale });
  return {
    title: t("verify.title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (session) {
    redirect(`/${locale}/forms`);
  }

  // Read authFlowToken from cookie
  const authFlowTokenCookie = (await cookies()).get("authFlowToken");
  const authToken = authFlowTokenCookie?.value ? JSON.parse(authFlowTokenCookie.value) : null;

  return (
    <div id="auth-panel">
      <MFAForm authToken={authToken} />
    </div>
  );
}
