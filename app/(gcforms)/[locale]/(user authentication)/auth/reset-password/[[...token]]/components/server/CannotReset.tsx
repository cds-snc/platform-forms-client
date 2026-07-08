import { serverTranslation } from "@i18n/server";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { BackArrowIcon } from "@serverComponents/icons";

export const CannotReset = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation(["reset-password", "common"], { lang: locale });

  const homeHref = `/${locale}/auth/login`;
  const supportHref = `/${locale}/support`;

  return (
    <div>
      <h2 className="mt-4 mb-6 p-0" data-testid="session-expired">
        {t("resetFailed.title")}
      </h2>
      <p className="mb-10">{t("resetFailed.description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={homeHref} className="mr-3 mb-2">
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
