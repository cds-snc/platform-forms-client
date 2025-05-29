import { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsInterval } from "@gcforms/types";
import { updateNotificationsInterval } from "../actions";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { isVaultDelivery } from "@lib/utils/form-builder";
import { logMessage } from "@lib/logger";

export const Notifications = ({
  formId,
  notificationsInterval,
}: {
  formId: string;
  notificationsInterval?: NotificationsInterval;
}) => {
  const { t } = useTranslation("form-builder");
  const { getDeliveryOption, setNotificationsInterval } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
    setNotificationsInterval: s.setNotificationsInterval,
  }));

  const isVault = isVaultDelivery(getDeliveryOption());
  const [notificationValue, setNotificationValue] = useState<string>(
    notificationsInterval ? String(notificationsInterval) : String(NotificationsInterval.OFF)
  );

  //TEMP
  logMessage.info(
    `Notifications component - notificationsInterval=${notificationsInterval}, notificationValue=${notificationValue}, isVault=${isVault}`
  );

  const toggleChecked = useCallback(
    () =>
      setNotificationValue(
        notificationValue === String(NotificationsInterval.OFF)
          ? String(NotificationsInterval.DAY)
          : String(NotificationsInterval.OFF)
      ),
    [notificationValue]
  );

  const updateNotificationsIntervalError = t(
    "settings.notifications.errors.updateNotificationsInterval"
  );

  const updateNotificationsIntervalSuccess = t("settings.notifications.savedSuccessMessage");

  const saveNotificationsValue = useCallback(async () => {
    const newNotificationsInterval: NotificationsInterval =
      notificationValue === String(NotificationsInterval.DAY)
        ? NotificationsInterval.DAY
        : NotificationsInterval.OFF;
    // To help track if many users are disabling notifications - yes, then default to off
    if (newNotificationsInterval === NotificationsInterval.OFF) {
      ga("form_notifications", {
        formId,
        action: "disabled",
      });
    }

    const result = await updateNotificationsInterval(formId, newNotificationsInterval);

    if (result && result.error) {
      toast.error(updateNotificationsIntervalError);
    } else {
      setNotificationsInterval(newNotificationsInterval);
      toast.success(updateNotificationsIntervalSuccess);
    }
  }, [
    formId,
    notificationValue,
    updateNotificationsIntervalError,
    updateNotificationsIntervalSuccess,
    setNotificationsInterval,
  ]);

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.description1")}</p>
      <p className="mb-8">{t("settings.notifications.description2")}</p>
      <div className="mb-4">
        <NotificationsToggle
          isChecked={
            isVault && notificationValue === String(NotificationsInterval.DAY) ? true : false
          }
          toggleChecked={toggleChecked}
          onLabel={t("settings.notifications.options.off")}
          offLabel={t("settings.notifications.options.on")}
          description={t("settings.notifications.optionsDescription")}
          disabled={!isVault}
        />
      </div>
      <Button
        dataTestId="form-notifications-save"
        theme="secondary"
        onClick={saveNotificationsValue}
        disabled={!isVault}
      >
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
