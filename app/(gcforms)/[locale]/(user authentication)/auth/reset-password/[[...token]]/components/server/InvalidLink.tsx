import { serverTranslation } from "@i18n";
import { BackArrowIcon } from "@serverComponents/icons";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export const InvalidLink = async ({ locale }: { locale: string }) => {
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
        <LinkButton.Primary href={homeHref} className="mb-2 mr-3">
          <span>
            <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
            {t("account.actions.backToSignIn", { ns: "common" })}
          </span>
        </LinkButton.Primary>
        <LinkButton.Secondary href={supportHref} className="mb-2">
          {t("errorPanel.cta.support", { ns: "common" })}
        </LinkButton.Secondary>
      </div>
    </div>
  );
};
