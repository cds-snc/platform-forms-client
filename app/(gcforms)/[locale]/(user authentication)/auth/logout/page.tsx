import { serverTranslation } from "@i18n";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { LocalTime } from "./components/LocalTime";
import { SignInButton } from "./components/SignInButton";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("logout", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;
  const isOidcEnabled =
    process.env.APP_ENV !== "test" && (await checkOne(FeatureFlags.zitadelLogin));
  const hasGcPlatformLoginHint =
    isOidcEnabled &&
    (await cookies()).get(GC_PLATFORM_LOGIN_HINT_COOKIE)?.value === GC_PLATFORM_LOGIN_HINT_VALUE;

  const { t } = await serverTranslation("logout", { lang: locale });

  return (
    <div id="auth-panel">
      <h1 className="mt-6 mb-12 border-b-0">{t("messageContent")}</h1>
      <LocalTime locale={locale} />
      <div>
        {isOidcEnabled && hasGcPlatformLoginHint ? (
          <SignInButton locale={locale} label={t("goToSignInLabel")} />
        ) : (
          <LinkButton.Primary href={`/${locale}/auth/login`}>
            {t("goToSignInLabel")}
          </LinkButton.Primary>
        )}
      </div>
    </div>
  );
}
