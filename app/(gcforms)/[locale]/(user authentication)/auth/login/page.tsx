import { serverTranslation } from "@i18n";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { Metadata } from "next";
import { cookies } from "next/headers";
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
  const isZitadelLoginEnabled =
    process.env.APP_ENV !== "test" && (await checkOne(FeatureFlags.zitadelLogin));
  const cookieStore = await cookies();
  const hasGcPlatformLoginHint =
    cookieStore.get(GC_PLATFORM_LOGIN_HINT_COOKIE)?.value === GC_PLATFORM_LOGIN_HINT_VALUE;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  if (session) {
    redirect(`/${locale}/forms`);
  }
  if (isZitadelLoginEnabled && hasGcPlatformLoginHint) {
    return <OidcRedirect locale={locale} />;
  }

  return (
    <div id="auth-panel">
      <LoginForm />
    </div>
  );
}
