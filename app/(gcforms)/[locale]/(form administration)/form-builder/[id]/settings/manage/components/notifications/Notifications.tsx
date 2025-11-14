"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getNotificationsUser, updateNotificationsUser } from "./actions";
import { NotificationsUsersList } from "./NotificationsUsersList";
import { NotificationsUserSetting } from "./NotificationsUserSetting";

export type NotificationsUser = {
  id: string;
  email: string;
  enabled: boolean;
};

export const Notifications = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const generalError = t("settings.notifications.error.getNotifcations");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");
  const [sessionUser, setSessionUser] = useState<NotificationsUser | null>(null);

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  // Fetch notifications settings on mount
  useEffect(() => {
    const getSettings = async () => {
      try {
        const sessionUserWithSetting = await getNotificationsUser(formId);
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

  const handleToggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (!sessionUser) return;

      // Optimistically update UI
      setSessionUser((prev) => (prev ? { ...prev, enabled } : null));

      // Save to database
      const result = await updateNotificationsUser(formId, { ...sessionUser, enabled });
      if (result !== undefined && "error" in result) {
        // Revert on error
        setSessionUser((prev) => (prev ? { ...prev, enabled: !enabled } : null));
        toast.error(updateNotificationsError);
        return;
      }

      toast.success(updateNotificationsSuccess);
      ga("form_notifications", {
        formId,
        action: enabled ? "enabled" : "disabled",
      });
    },
    [formId, sessionUser, updateNotificationsError, updateNotificationsSuccess]
  );

  // This is a legacy published form with email delivery, don't show Notifications
  if (getDeliveryOption()) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <NotificationsUserSetting sessionUser={sessionUser} onToggle={handleToggleNotifications} />
      <NotificationsUsersList formId={formId} />
    </div>
  );
};
