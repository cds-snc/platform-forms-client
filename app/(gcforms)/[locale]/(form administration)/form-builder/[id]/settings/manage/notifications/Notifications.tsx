import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getSessionUserWithSetting, updatSessionUserSetting } from "./actions";
import { NotificationsUsersList } from "./NotificationsUsersList";

export type NotificationsUser = {
  id: string;
  email: string;
  enabled: boolean;
};

export const Notifications = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const generalError = t("settings.notifications.error.general");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");
  const [sessionUser, setSessionUser] = useState<NotificationsUser | null>(null);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const sessionUserWithSetting = await getSessionUserWithSetting(formId);
        if (!sessionUserWithSetting || "error" in sessionUserWithSetting) {
          throw new Error();
        }
        setSessionUser(sessionUserWithSetting);
      } catch (error) {
        toast.error(generalError);
      }
    };
    getSettings();
  }, [formId, generalError]);

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  const toggleChecked = useCallback(
    () =>
      setSessionUser((prev) => {
        if (!prev) {
          return null;
        }
        return {
          ...prev,
          enabled: !sessionUser?.enabled,
        };
      }),
    [sessionUser]
  );

  const updateNotifications = useCallback(async () => {
    const result = await updatSessionUserSetting(formId, sessionUser);
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

  // This is a published form with email delivery or a legacy form that has no users.
  // Don't show the Notifications settings.
  if (getDeliveryOption() || !sessionUser) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.sessionUser.title")}</p>
      <p className="mb-4">{t("settings.notifications.sessionUser.description")}</p>
      <NotificationsToggle
        className="mb-4"
        isChecked={sessionUser.enabled}
        toggleChecked={toggleChecked}
        onLabel={t("settings.notifications.sessionUser.toggle.off")}
        offLabel={t("settings.notifications.sessionUser.toggle.on")}
        description={t("settings.notifications.sessionUser.toggle.title", {
          email: sessionUser.email,
        })}
      />
      <NotificationsUsersList formId={formId} />
      <Button dataTestId="form-notifications-save" theme="secondary" onClick={updateNotifications}>
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
