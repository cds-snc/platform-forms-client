import { WarningIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";

export const SaveNote = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="flex max-w-[260px] py-3 text-sm italic">
      <div>
        <WarningIcon className="mr-2" />
      </div>
      <div>{t("logic.saveNote")}</div>
    </div>
  );
};
