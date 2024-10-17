"use client";

import { isFutureDate } from "lib/utils/date/isFutureDate";
import { useTranslation } from "@i18n/client";
import { formClosingDateEst } from "lib/utils/date/utcToEst";

export const Notice = ({ closingDate }: { closingDate?: string }) => {
  const { t } = useTranslation("common");

  if (!closingDate) {
    return null;
  }

  if (!isFutureDate(closingDate)) {
    return null;
  }

  const { month, day, year, hour, minute } = formClosingDateEst(closingDate);
  const closingText = t("closingNotice.text2", {
    month,
    day,
    year,
    hour,
    minute,
  });
  return (
    <div className="mb-4 w-3/5 border-l-8 border-gcds-blue-750 pl-4">
      <div className="mb-6 font-bold text-gcds-blue-750">{t("closingNotice.title")}</div>
      <p className="pb-2">
        {t("closingNotice.text1")} <br />
        <span className="font-bold">
          {closingText}
          <br />
          {t("closingNotice.text3")}
        </span>
      </p>
    </div>
  );
};
