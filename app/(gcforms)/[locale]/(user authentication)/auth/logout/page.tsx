import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { LocalTime } from "./components/LocalTime";

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
      <div className="items-center pb-10 pt-3 text-sm font-normal not-italic">
        <LocalTime locale={locale} />
      </div>
      <div>
        <LinkButton.Primary href={`/${locale}/auth/login`}>
          {t("goToSignInLabel")}
        </LinkButton.Primary>
      </div>
    </div>
  );
}
