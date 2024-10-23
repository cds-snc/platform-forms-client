import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";

export const ManageFormAccessButton = () => {
  const { t } = useTranslation("manage-form-access");
  const { Event } = useCustomEvent();

  const openManageFormAccessDialog = () => {
    Event.fire("open-form-access-dialog");
  };

  return (
    <Button
      theme="secondary"
      className="border-1 px-3 py-2 text-sm"
      onClick={openManageFormAccessDialog}
    >
      {t("manageFormAccess")}
    </Button>
  );
};
