import { serverTranslation } from "@i18n";
import { ExclamationIcon } from "@serverComponents/icons";
import { overdueSettings } from "../../actions";

export const OverdueStatus = async ({ level }: { level: number }) => {
  const { t } = await serverTranslation("admin-forms");
  const { promptPhaseDays: promptAfter, warnPhaseDays: warnAfter } = await overdueSettings();

  // 35 days +
  if ([3, 4].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">
        <ExclamationIcon className="mr-2 inline-block h-6 w-6" />
        {t("overdueResponses", { days: warnAfter })}
      </span>
    );
  }
  // 21 days +
  if ([1, 2].includes(level)) {
    return (
      <span className="mb-2 block p-2 text-red">
        <ExclamationIcon className="mr-2 inline-block h-6 w-6" />
        {t("overdueResponses", { days: promptAfter })}
      </span>
    );
  }

  return null;
};
