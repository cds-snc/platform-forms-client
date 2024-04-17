import { serverTranslation } from "@i18n";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { FocusHeader } from "../../../components/client/FocusHeader";

export const Success = async ({ lang }: { lang: string }) => {
  const { t } = await serverTranslation("unlock-publishing", { lang });
  return (
    <>
      <FocusHeader>{t("unlockPublishingSubmitted.title")}</FocusHeader>
      <h2>{t("unlockPublishingSubmitted.whatNext.title")}</h2>
      <p>{t("unlockPublishingSubmitted.whatNext.paragraph1")}</p>
      <p className="mt-8 font-bold">{t("unlockPublishingSubmitted.whatNext.paragraph2")}</p>
      <p>{t("unlockPublishingSubmitted.whatNext.paragraph3")}</p>
      <p className="mt-8">{t("unlockPublishingSubmitted.whatNext.paragraph4")}</p>
      <LinkButton.Primary className="mt-8" href={`/${lang}/forms/`}>
        {t("continue", { ns: "common" })}
      </LinkButton.Primary>
    </>
  );
};
