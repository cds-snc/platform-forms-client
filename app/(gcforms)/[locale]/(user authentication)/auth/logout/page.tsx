import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { LocalTime } from "./components/LocalTime";
import { signOut } from "@lib/auth";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("logout", { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation("logout", { lang: locale });

  await signOut();

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
