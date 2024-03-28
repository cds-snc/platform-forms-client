import { serverTranslation } from "@i18n";

import { LinkButton } from "@serverComponents/globals";

export const CheckEmail = async ({ locale }: { locale: string }) => {
  const continueHref = `/${locale}/form-builder`;
  const { t } = await serverTranslation("reset-password", { lang: locale });
  return (
    <div>
      <h2 className="mt-4 mb-6 p-0">{t("magicLink.title")}</h2>
      <p className="mb-10">{t("magicLink.description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={continueHref} className="mb-2">
          {t("magicLink.cta.label")}
        </LinkButton.Primary>
      </div>
    </div>
  );
};
