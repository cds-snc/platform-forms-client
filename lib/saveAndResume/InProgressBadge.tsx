import { customTranslate } from "@lib/i18nHelpers";
import { type Language } from "@lib/types/form-builder-types";

export const InProgressBadge = ({ language }: { language: Language }) => {
  const { t } = customTranslate("common");
  return (
    <div className="rounded-sm bg-gcds-green-100 p-4">
      {t("saveAndResume.downloadProgressHtml.badge.text", {
        lng: language,
      })}
    </div>
  );
};
