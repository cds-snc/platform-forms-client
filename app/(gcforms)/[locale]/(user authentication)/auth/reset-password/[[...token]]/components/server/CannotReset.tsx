import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { BackArrowIcon } from "@serverComponents/icons";

export const CannotReset = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation("reset-password", { lang: locale });

  const homeHref = `/${locale}/auth/login`;
  const supportHref = `/${locale}/support`;

  return (
    <div>
      <h2 className="mb-6 mt-4 p-0" data-testid="session-expired">
        {t("resetFailed.title")}
      </h2>
      <p className="mb-10">{t("resetFailed.description")}</p>
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
