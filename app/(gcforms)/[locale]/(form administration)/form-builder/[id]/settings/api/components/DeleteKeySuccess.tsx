import { useTranslation } from "@i18n/client";
import LinkButton from "@serverComponents/globals/Buttons/LinkButton";

export const DeleteKeySuccess = ({ id }: { id: string }) => {
  const { t, i18n } = useTranslation("form-builder");

  const responsesHref = `/${i18n.language}/form-builder/${id}/responses`;

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("settings.api.deleteKeySuccess.title")}
      </h3>
      <p className="mb-2 text-black">
        {t("settings.api.deleteKeySuccess.message")}
        <LinkButton href={responsesHref} className="inline-block">
          {t("settings.api.deleteKeySuccess.responseLinkText")}
        </LinkButton>
      </p>
    </div>
  );
};
