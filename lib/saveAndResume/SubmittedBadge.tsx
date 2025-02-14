import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { formClosingDateEst as utcToEst } from "lib/utils/date/utcToEst";

export const SubmittedBadge = ({ language }: { language: Language }) => {
  const { t } = customTranslate("common");
  const { month, day, year } = utcToEst(new Date().toISOString(), language);
  return (
    <div>
      <div className="mr-4 inline-block max-w-fit rounded-lg bg-gcds-green-100 px-4 py-2">
        {t("saveResponse.downloadHtml.badge.text", {
          lng: language,
        })}
      </div>
      <div className="inline-block">
        {t("saveResponse.downloadHtml.badge.lastSaved", {
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
