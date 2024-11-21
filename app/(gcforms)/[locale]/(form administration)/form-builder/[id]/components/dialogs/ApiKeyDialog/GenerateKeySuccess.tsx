import { useTranslation } from "@i18n/client";
import LinkButton from "@serverComponents/globals/Buttons/LinkButton";

export const GenerateKeySuccess = () => {
  const { t } = useTranslation("form-builder");

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("settings.api.generateKeySuccess.title")}
      </h3>
      <p className="mb-2 text-black">
        {t("settings.api.generateKeySuccess.message")}
        <LinkButton href={t("settings.api.generateKeySuccess.docsLink")} className="inline-block">
          {t("settings.api.generateKeySuccess.docsLinkText")}
        </LinkButton>
      </p>
    </div>
  );
};
