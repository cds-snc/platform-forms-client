import { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsInterval } from "packages/types/src/form-types";
import { updateNotificationsInterval } from "../actions";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";

export const Notifications = ({
  formId,
  notificationsInterval,
  isPublished,
}: {
  formId: string;
  notificationsInterval: NotificationsInterval | undefined;
  isPublished: boolean;
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
          disabled={isPublished}
        />
      </div>
      <Button
        disabled={isPublished}
        dataTestId="form-notifications-save"
        theme="secondary"
        // type="submit"
        onClick={() => saveNotificationsValue()}
      >
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
