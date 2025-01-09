import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheckAndThrow } from "@lib/actions";
import { redirect } from "next/navigation";
import { RegistrationForm } from "./components/client/RegistrationForm";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("signup", { lang: locale });
  return {
    title: t("signUpRegistration.title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (session) redirect(`/${locale}/forms/`);

  return (
    <div id="auth-panel">
      <RegistrationForm />
    </div>
  );
}
