import { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsInterval } from "packages/types/src/form-types";
import { updateNotificationsInterval } from "../actions";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";

export const Notifications = ({
  formId,
  notificationsInterval,
}: {
  formId: string;
  notificationsInterval: NotificationsInterval | undefined;
}) => {
  const { t } = useTranslation("form-builder");
  const [notificationValue, setNotificationValue] = useState<string>(
    notificationsInterval ? String(notificationsInterval) : String(NotificationsInterval.OFF)
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
    await updateNotificationsInterval(formId, newNotificationsInterval).catch(() =>
      toast.error(updateNotificationsIntervalError)
    );
  }, [formId, notificationValue, updateNotificationsIntervalError]);

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.description1")}</p>
      <p className="mb-8">{t("settings.notifications.description2")}</p>
      <div className="mb-4">
        <NotificationsToggle
          isChecked={notificationValue === String(NotificationsInterval.DAY) ? true : false}
          toggleChecked={toggleChecked}
          onLabel={t("settings.notifications.options.off")}
          offLabel={t("settings.notifications.options.on")}
          description={t("settings.notifications.optionsDescription")}
        />
      </div>
      <Button
        dataTestId="form-notifications-save"
        theme="secondary"
        onClick={() => saveNotificationsValue()}
      >
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
