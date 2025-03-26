import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { formClosingDateEst as utcToEst } from "lib/utils/date/utcToEst";

export const SubmittedBadge = ({
  language,
  submissionId,
  submissionDate,
}: {
  language: Language;
  submissionId?: string;
  submissionDate?: string;
}) => {
  const { t } = customTranslate("common");

  let month = "";
  let day = "";
  let year = "";

  try {
    const dates = (submissionDate && utcToEst(submissionDate, language)) || {
      month: "",
      day: "",
      year: "",
    };
    month = dates.month || "";
    day = dates.day || "";
    year = dates.year || "";
  } catch (e) {
    // noop
  }

  if (!month || !day || !year) {
    return null;
  }

  return (
    <div data-testid="submitted-badge">
      <div className="mr-4 inline-block max-w-fit rounded-lg bg-gcds-green-100 px-4 py-2">
        <div>
          <span className="font-bold">
            {t("saveResponse.downloadHtml.badge.text", {
              lng: language,
            })}
          </span>
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
          {submissionId && (
            <span className="mt-1 block">
              {t("saveResponse.downloadHtml.badge.submissionId", {
                lng: language,
                submissionId,
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
