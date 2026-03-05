import { serverTranslation } from "@i18n";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { Metadata } from "next";
import { FederatedLogout } from "./components/FederatedLogout";
import { LocalTime } from "./components/LocalTime";
import { SignInButton } from "./components/SignInButton";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

const getOidcEndSessionEndpoint = async (): Promise<string | null> => {
  const issuer = process.env.NEXT_PUBLIC_ZITADEL_URL;
  if (!issuer) {
    return null;
  }

  const discoveryUrl = new URL(
    ".well-known/openid-configuration",
    issuer.endsWith("/") ? issuer : `${issuer}/`
  ).toString();

  try {
    const response = await fetch(discoveryUrl, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { end_session_endpoint?: string };
    return payload.end_session_endpoint ?? null;
  } catch {
    return null;
  }
};

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
  const isOidc = process.env.APP_ENV !== "test" && (await checkOne(FeatureFlags.zitadelLogin));
  const endSessionEndpoint = isOidc ? await getOidcEndSessionEndpoint() : null;
  const clientId = process.env.ZITADEL_CLIENT_ID;

  const { t } = await serverTranslation("logout", { lang: locale });

  return (
    <div id="auth-panel">
      <h1 className="mb-12 mt-6 border-b-0">{t("messageContent")}</h1>
      <LocalTime locale={locale} />
      {endSessionEndpoint && (
        <FederatedLogout
          endSessionEndpoint={endSessionEndpoint}
          returnTo={`/${locale}/auth/logout`}
          onceKey={locale}
          clientId={clientId}
        />
      )}
      <div>
        {isOidc ? (
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
