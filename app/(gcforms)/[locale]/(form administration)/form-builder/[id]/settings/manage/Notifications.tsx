import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { Button } from "@clientComponents/globals";
import { useCallback, useState } from "react";
import { updateNotificationsInterval } from "./actions";
import { NotificationsInterval } from "packages/types/src/form-types";
import { useTranslation } from "@i18n/client";

export const Notifications = ({
  formId,
  notifcationsInterval,
}: {
  formId: string;
  notifcationsInterval: NotificationsInterval | undefined;
}) => {
  const { t } = useTranslation("form-builder");
  const [notificationValue, setNotificationValue] = useState<string>(
    notifcationsInterval ? String(notifcationsInterval) : String(NotificationsInterval.OFF)
  );

  const updateNotificationsValue = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNotificationValue(value);
  }, []);

  const saveNotificationsValue = useCallback(async () => {
    let newNotificationsInterval: NotificationsInterval = NotificationsInterval.OFF;
    switch (parseInt(notificationValue)) {
      case NotificationsInterval.DAY:
        newNotificationsInterval = NotificationsInterval.DAY;
        break;
      case NotificationsInterval.WEEK:
        newNotificationsInterval = NotificationsInterval.WEEK;
        break;
    }
    await updateNotificationsInterval(formId, newNotificationsInterval);
  }, [formId, notificationValue]);

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.description1")}</p>
      <p className="mb-8">{t("settings.notifications.description2")}</p>
      <div className="">
        <div className="mb-6">
          <Radio
            id={`notifications-daily`}
            checked={notificationValue === String(NotificationsInterval.DAY)}
            name="notifications"
            value={String(NotificationsInterval.DAY)}
            label={t("settings.notifications.options.daily")}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
        <div className="mb-6">
          <Radio
            id={`notifications-weekly`}
            checked={notificationValue === String(NotificationsInterval.WEEK)}
            name="notifications"
            value={String(NotificationsInterval.WEEK)}
            label={t("settings.notifications.options.weekly")}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
        <div className="mb-8">
          <Radio
            id={`notifications-off`}
            checked={notificationValue === String(NotificationsInterval.OFF)}
            name="notifications"
            value={String(NotificationsInterval.OFF)}
            label={t("settings.notifications.options.never")}
            onChange={updateNotificationsValue}
            className="mb-0"
          />
        </div>
      </div>
      <Button
        dataTestId="form-notifications-save"
        theme="secondary"
        type="submit"
        onClick={() => saveNotificationsValue()}
      >
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
