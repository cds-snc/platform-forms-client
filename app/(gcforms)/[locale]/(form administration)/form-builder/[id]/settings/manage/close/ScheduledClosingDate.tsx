"use client";

import { isFutureDate } from "lib/utils/date/isFutureDate";
import { useTranslation } from "@i18n/client";
import { formClosingDateEst } from "lib/utils/date/utcToEst";
import { logMessage } from "@lib/logger";
import { useRehydrate } from "@lib/store/useTemplateStore";

export const ScheduledClosingDate = ({
  closingDate,
  language,
}: {
  closingDate?: string;
  language: string;
}) => {
  const { t } = useTranslation("common");

  const hasHydrated = useRehydrate();

  if (!hasHydrated) {
    return null;
  }

  if (!closingDate) {
    return null;
  }

  if (!isFutureDate(closingDate)) {
    return null;
  }

  let month, day, year, hour, minute, dayPeriod;

  try {
    ({ month, day, year, hour, minute, dayPeriod } = formClosingDateEst(closingDate, language));
  } catch (error) {
    logMessage.info("Unable to parse closing date", closingDate);
    return null;
  }

  if (!month || !day || !year || !hour || !minute || !dayPeriod) {
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
        dayPeriod,
      })}
    </div>
  );
};
