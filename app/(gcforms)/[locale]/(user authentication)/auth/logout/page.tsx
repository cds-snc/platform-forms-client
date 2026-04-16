import { serverTranslation } from "@i18n";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";
import { Metadata } from "next";
import { LocalTime } from "./components/LocalTime";
import { SignInButton } from "./components/SignInButton";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

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

  const { t } = await serverTranslation("logout", { lang: locale });

  return (
    <div id="auth-panel">
      <h1 className="mt-6 mb-12 border-b-0">{t("messageContent")}</h1>
      <LocalTime locale={locale} />
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
