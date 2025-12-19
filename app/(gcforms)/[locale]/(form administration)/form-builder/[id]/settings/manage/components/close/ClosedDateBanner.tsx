import { useTranslation } from "@i18n/client";
import { Alert } from "@clientComponents/globals";
import { formClosingDateEst } from "lib/utils/date/utcToEst";
import { dateHasPast } from "lib/utils";

export const ClosedDateBanner = ({ closingDate }: { closingDate?: string | null }) => {
  const { t } = useTranslation("form-builder");

  if (!closingDate) {
    return null;
  }

  const isPastClosingDate = dateHasPast(Date.parse(closingDate));

  const { month, day, year, hour, minute } = formClosingDateEst(closingDate);

  const closedText = t("closingDate.banner.text", {
    month,
    day,
    year,
    hour,
    minute,
  });

  if (!isPastClosingDate) {
    return null;
  }

  return (
    <Alert.Info>
      <p className="mt-3 font-bold">{closedText}</p>
    </Alert.Info>
  );
};
