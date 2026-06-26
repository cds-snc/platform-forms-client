import { serverTranslation } from "@i18n/server";
import { ExclamationIcon } from "@serverComponents/icons";

export const Overdue = async () => {
  const { t } = await serverTranslation("admin-forms");
  return (
    <span className="text-red mb-2 block p-2">
      <ExclamationIcon className="mr-2 inline-block size-6" />
      {t("overdueResponses")}
    </span>
  );
};
