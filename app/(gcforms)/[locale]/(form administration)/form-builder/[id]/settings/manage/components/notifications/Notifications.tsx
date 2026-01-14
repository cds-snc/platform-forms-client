"use client";

import React from "react";
import { useTranslation } from "@i18n/client";
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

export const Notifications = ({
  formId,
  userIsNotifiable,
  userHasNotificationsEnabled,
  loggedInUser,
  userNotificationsForForm,
}: {
  formId: string;
  userIsNotifiable: boolean;
  userHasNotificationsEnabled: boolean;
  loggedInUser: { id: string; email: string };
  userNotificationsForForm: NotificationsUser[] | null;
}) => {
  const { t } = useTranslation("form-builder");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");

  const [usersList, setUsersList] = React.useState(userNotificationsForForm);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    userHasNotificationsEnabled
  );

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  // This is a legacy published form with email delivery, don't show Notifications
  if (getDeliveryOption()) {
    return null;
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    const result = await updateNotificationsUser(formId, { ...loggedInUser, enabled });
    if (result !== undefined && "error" in result) {
      toast.error(updateNotificationsError);
      return;
    }

    setNotificationsEnabled(enabled);

    // Update the user in the list as well
    if (usersList) {
      setUsersList(
        usersList.map((user) => (user.id === loggedInUser.id ? { ...user, enabled } : user))
      );
    }

    toast.success(updateNotificationsSuccess);

    ga("form_notifications", {
      formId,
      action: enabled ? "enabled" : "disabled",
    });
  };

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      {userIsNotifiable && (
        <NotificationsUserSetting
          loggedInUser={loggedInUser}
          userHasNotificationsEnabled={notificationsEnabled}
          onToggle={handleToggleNotifications}
        />
      )}
      {usersList && <NotificationsUsersList userNotificationsForForm={usersList} />}
    </div>
  );
};
