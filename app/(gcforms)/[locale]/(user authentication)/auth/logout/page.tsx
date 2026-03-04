import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LocalTime } from "./components/LocalTime";
import { SignInButton } from "./components/SignInButton";

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

  const { t } = await serverTranslation("logout", { lang: locale });

  return (
    <div id="auth-panel">
      <h1 className="mb-12 mt-6 border-b-0">{t("messageContent")}</h1>
      <LocalTime locale={locale} />
      <div>
        <SignInButton locale={locale} label={t("goToSignInLabel")} />
      </div>
    </div>
  );
}
