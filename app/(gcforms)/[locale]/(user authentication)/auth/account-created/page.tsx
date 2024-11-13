import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
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
    <div>
      <h1 className="mb-12 mt-6 border-b-0">{t("accountCreated.title")}</h1>
      <h3 className="!mb-2">{t("accountCreated.yourAccountListDescription")}</h3>
      <ul className="mb-4">
        <li>{t("accountCreated.yourAccountList.item1")}</li>
        <li>{t("accountCreated.yourAccountList.item2")}</li>
        <li>{t("accountCreated.yourAccountList.item3")}</li>
      </ul>
      <h3 className="!mb-2">{t("accountCreated.notIncluded.title")}</h3>
      <p className="mb-8">{t("accountCreated.notIncluded.paragraph1")}</p>
      <h3 className="!mb-2">{t("accountCreated.unlockPublishing.title")}</h3>
      <p className="mb-4">{t("accountCreated.unlockPublishing.paragraph1")}</p>
      <p>{t("accountCreated.unlockPublishing.paragraph2")}</p>
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
