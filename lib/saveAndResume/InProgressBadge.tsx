import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { formClosingDateEst as utcToEst } from "lib/utils/date/utcToEst";

export const InProgressBadge = ({ language }: { language: Language }) => {
  const { t } = customTranslate("common");
  const { month, day, year } = utcToEst(new Date().toISOString(), language);
  return (
    <div data-testid="in-progress-badge">
      <div className="mr-4 inline-block max-w-fit rounded-lg bg-violet-50 px-4 py-2">
        {t("saveAndResume.downloadProgressHtml.badge.text", {
          lng: language,
        })}
      </div>
      <div className="inline-block">
        {t("saveAndResume.downloadProgressHtml.badge.lastSaved", {
          lng: language,
          day,
          month,
          year,
          interpolation: {
            escapeValue: false,
          },
        })}
      </div>
    </div>
  );
};
