import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authCheck } from "@lib/actions";
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
  const { session } = await authCheck().catch(() => ({ session: null }));

  if (session) redirect(`/${locale}/forms/`);

  return (
    <div id="auth-panel">
      <RegistrationForm />
    </div>
  );
}
