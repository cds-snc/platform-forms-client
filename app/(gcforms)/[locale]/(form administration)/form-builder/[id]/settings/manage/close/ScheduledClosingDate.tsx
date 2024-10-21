"use client";

import { isFutureDate } from "lib/utils/date/isFutureDate";
import { useTranslation } from "@i18n/client";
import { formClosingDateEst } from "lib/utils/date/utcToEst";
import { logMessage } from "@lib/logger";

export const ScheduledClosingDate = ({
  closingDate,
  language,
}: {
  closingDate?: string;
  language: string;
}) => {
  const { t } = useTranslation("common");

  if (!closingDate) {
    return null;
  }

  if (!isFutureDate(closingDate)) {
    return null;
  }

  let month, day, year, hour, minute;

  try {
    ({ month, day, year, hour, minute } = formClosingDateEst(closingDate, language));
  } catch (error) {
    logMessage.info("Unable to parse closing date", closingDate);
    return null;
  }

  if (!month || !day || !year || !hour || !minute) {
    return null;
  }

  return (
    <div className="mb-4">
      {t("closingNotice.text1")}{" "}
      {t("closingNotice.text2", {
        month,
        day,
        year,
        hour,
        minute,
      })}
    </div>
  );
};
