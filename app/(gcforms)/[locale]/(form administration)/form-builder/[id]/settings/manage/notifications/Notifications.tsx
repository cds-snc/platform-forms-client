import { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { updateNotificationsUser } from "./actions";
import { NotificationsUsersList } from "./NotificationsUsersList";
import { NotificationsUserSetting } from "./NotificationsUserSetting";

export type NotificationsUser = {
  id: string;
  email: string;
  enabled: boolean;
};

export const Notifications = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");
  const [sessionUser, setSessionUser] = useState<NotificationsUser | null>(null);

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  const updateNotifications = useCallback(async () => {
    const result = await updateNotificationsUser(formId, sessionUser);
    if (result !== undefined && "error" in result) {
      toast.error(updateNotificationsError);
      return;
    }

    toast.success(updateNotificationsSuccess);
    ga("form_notifications", {
      formId,
      action: sessionUser?.enabled ? "enabled" : "disabled",
    });
  }, [formId, sessionUser, updateNotificationsError, updateNotificationsSuccess]);

  // This is a legacy published form with email delivery, don't show Notifications
  if (getDeliveryOption()) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <NotificationsUserSetting
        formId={formId}
        sessionUser={sessionUser}
        setSessionUser={setSessionUser}
      />
      <NotificationsUsersList formId={formId} />
      <Button dataTestId="form-notifications-save" theme="secondary" onClick={updateNotifications}>
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
