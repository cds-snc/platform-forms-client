import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("signup", { lang: locale });
  return {
    title: t("accountCreated.title"),
  };
}

export default async function Page() {
  const { t, i18n } = await serverTranslation(["signup"]);

  return (
    <div id="auth-panel">
      <h1 className="border-b-0 mt-6 mb-12">{t("accountCreated.title")}</h1>
      <h2>{t("accountCreated.yourAccountListDescription")}</h2>
      <ul>
        <li>{t("accountCreated.yourAccountList.item1")}</li>
        <li>{t("accountCreated.yourAccountList.item2")}</li>
        <li>{t("accountCreated.yourAccountList.item3")}</li>
      </ul>
      <h2 className="mt-8">{t("accountCreated.notIncluded.title")}</h2>
      <p>{t("accountCreated.notIncluded.paragraph1")}</p>
      <h2 className="mt-8">{t("accountCreated.unlockPublishing.title")}</h2>
      <p>{t("accountCreated.unlockPublishing.paragraph1")}</p>
      <p className="mt-6">{t("accountCreated.unlockPublishing.paragraph2")}</p>
      <div className="mt-20">
        <LinkButton.Primary href={`/${i18n.language}/unlock-publishing/`} className="mr-4">
          {t("accountCreated.unlockPublishingButton")}
        </LinkButton.Primary>
        <LinkButton.Secondary href={`/${i18n.language}/forms/`} testid="skipStepButton">
          {t("accountCreated.skipStepButton")}
        </LinkButton.Secondary>
      </div>
    </div>
  );
}
