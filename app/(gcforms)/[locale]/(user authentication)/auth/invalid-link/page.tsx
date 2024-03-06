import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { BackArrowIcon } from "@serverComponents/icons";
import { PrimaryLinkButton, SecondaryLinkButton } from "@clientComponents/globals";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["reset-password", "common"], { lang: locale });
  return {
    title: t("errorPanel.defaultTitle"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { t } = await serverTranslation(["reset-password", "common"], { lang: locale });
  const homeHref = `/${locale}/auth/login`;
  const supportHref = `/${locale}}/support`;
  return (
    <div>
      <h2 className="mb-6 mt-4 p-0" data-testid="session-expired">
        {t("errorPanel.defaultTitle")}
      </h2>
      <p className="mb-10">{t("errorPanel.defaultMessage")}</p>
      <div className="laptop:flex">
        <PrimaryLinkButton href={homeHref} className="mb-2 mr-3">
          <span>
            <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
            {t("account.actions.backToSignIn", { ns: "common" })}
          </span>
        </PrimaryLinkButton>
        <SecondaryLinkButton href={supportHref} className="mb-2">
          {t("errorPanel.cta.support", { ns: "common" })}
        </SecondaryLinkButton>
      </div>
    </div>
  );
}
