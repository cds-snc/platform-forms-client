import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";

export const KeepSafe = ({ language }: { language: Language }) => {
  const { t } = customTranslate("common");
  return (
    <div className="my-2">
      <p>
        {t("saveResponse.downloadHtml.keepSafe.description", {
          lng: language,
        })}
      </p>
    </div>
  );
};
