import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LoginForm } from "./components/client/LoginForm";
import { authCheckAndThrow } from "@lib/actions";
import { redirect } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["login"], { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  if (session) {
    redirect(`/${locale}/forms`);
  }

  return (
    <div id="auth-panel">
      <LoginForm />
    </div>
  );
}
