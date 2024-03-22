import { serverTranslation } from "@i18n";
import { BackArrowIcon } from "@serverComponents/icons";
import { PrimaryLinkButton, SecondaryLinkButton } from "@clientComponents/globals";

export const ExpiredLink = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation(["reset-password", "common"], { lang: locale });
  const homeHref = `/${locale}/auth/login`;
  const supportHref = `/${locale}}/support`;
  return (
    <div>
      <h2 className="mb-6 mt-4 p-0" data-testid="session-expired">
        {t("expiredLink.title")}
      </h2>
      <p className="mb-10">{t("expiredLink.description")}</p>
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
};
