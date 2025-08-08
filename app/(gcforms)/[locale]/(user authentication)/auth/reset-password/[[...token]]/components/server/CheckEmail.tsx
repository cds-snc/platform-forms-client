import { serverTranslation } from "@i18n";

import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export const CheckEmail = async ({ locale }: { locale: string }) => {
  const homeHref = `/${locale}/auth/login`;
  const { t } = await serverTranslation(["reset-password", "common"], { lang: locale });

  return (
    <div>
      <h2 className="mb-6 mt-4 p-0">{t("magicLink.title")}</h2>
      <p className="mb-10">{t("magicLink.description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={homeHref} className="mb-2">
          {t("account.actions.backToSignIn", { ns: "common" })}
        </LinkButton.Primary>
      </div>
    </div>
  );
};
