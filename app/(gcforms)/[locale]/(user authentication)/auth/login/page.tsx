import { serverTranslation } from "@i18n";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { Metadata } from "next";
import { LoginForm } from "./components/client/LoginForm";
import { OidcRedirect } from "./components/client/OidcRedirect";
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
  const isOidc = process.env.APP_ENV !== "test" && (await checkOne(FeatureFlags.zitadelLogin));

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  if (session) {
    redirect(`/${locale}/forms`);
  }

  {
    /* For OIDC we redirect to the SSO login page */
  }

  return <div id="auth-panel">{isOidc ? <OidcRedirect locale={locale} /> : <LoginForm />}</div>;
}
