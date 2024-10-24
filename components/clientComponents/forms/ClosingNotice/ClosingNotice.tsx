"use client";

import { isFutureDate } from "lib/utils/date/isFutureDate";
import { useTranslation } from "@i18n/client";
import { formClosingDateEst } from "lib/utils/date/utcToEst";
import { logMessage } from "@lib/logger";
import { useEffect, useState } from "react";

export const ClosingNotice = ({
  closingDate,
  language,
}: {
  closingDate?: string;
  language: string;
}) => {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);

  useEffect(() => setLoading(false), []);

  if (loading) {
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
    <div className="mb-6 w-3/5 border-l-8 border-gcds-blue-750 pl-4">
      <div className="mb-4 font-bold text-gcds-blue-750">{t("closingNotice.title")}</div>
      <p className="pb-2">
        {t("closingNotice.text1")} <br />
        <span className="font-bold">
          {t("closingNotice.text2", {
            month,
            day,
            year,
            hour,
            minute,
            dayPeriod,
          })}
        </span>
      </p>
    </div>
  );
};
