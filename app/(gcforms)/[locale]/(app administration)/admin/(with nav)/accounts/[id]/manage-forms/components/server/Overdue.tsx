import { serverTranslation } from "@i18n";
import { ExclamationIcon } from "@serverComponents/icons";

export const Overdue = async () => {
  const { t } = await serverTranslation("admin-forms");
  return (
    <span className="mb-2 block p-2 text-red">
      <ExclamationIcon className="mr-2 inline-block size-6" />
      {t("overdueResponses")}
    </span>
  );
};
