import { serverTranslation } from "@i18n";
import { Primary } from "@clientComponents/globals/Buttons/LinkButton";
import { FocusHeader } from "../../../components/client/FocusHeader";

export const Success = async () => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("unlock-publishing");
  return (
    <>
      <FocusHeader>{t("unlockPublishingSubmitted.title")}</FocusHeader>
      <h2>{t("unlockPublishingSubmitted.whatNext.title")}</h2>
      <p>{t("unlockPublishingSubmitted.whatNext.paragraph1")}</p>
      <p className="mt-8 font-bold">{t("unlockPublishingSubmitted.whatNext.paragraph2")}</p>
      <p>{t("unlockPublishingSubmitted.whatNext.paragraph3")}</p>
      <p className="mt-8">{t("unlockPublishingSubmitted.whatNext.paragraph4")}</p>
      <Primary className="mt-8" href={`/${language}/forms/`}>
        {t("continue", { ns: "common" })}
      </Primary>
    </>
  );
};
