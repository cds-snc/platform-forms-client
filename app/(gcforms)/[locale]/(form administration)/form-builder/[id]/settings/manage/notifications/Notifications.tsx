import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getNotificationsUsers, updateNotificationsUserSetting } from "../actions";
import { NotificationsUsersList } from "./NotificationsUsersList";
import { useSession } from "next-auth/react";

export type NotificationsUser = {
  id: string;
  email: string;
  enabled: boolean;
};

export const Notifications = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const { data } = useSession();

  const generalError = t("settings.notifications.error.general");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");

  const [notificationsUsers, setNotificationsUsers] = useState<{
    users: NotificationsUser[] | null;
    sessionUser: NotificationsUser | null;
  }>({
    users: [],
    sessionUser: null,
  });

  useEffect(() => {
    const getSettings = async () => {
      try {
        const allUsers = await getNotificationsUsers(formId);
        if ("error" in allUsers || !allUsers) {
          throw new Error();
        }

        const usersWithoutSessionUser =
          allUsers.filter((user) => user.id !== data?.user.id) || null;
        const sessionUserWithSetting = allUsers.find((user) => user.id === data?.user.id) || null;
        setNotificationsUsers({
          users: usersWithoutSessionUser,
          sessionUser: sessionUserWithSetting,
        });
      } catch (error) {
        toast.error(generalError);
      }
    };
    getSettings();
  }, [formId, generalError, data?.user.id]);

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  const toggleChecked = useCallback(
    () =>
      setNotificationsUsers((prev) => {
        if (!prev || !prev.sessionUser) {
          return prev;
        }
        return {
          ...prev,
          sessionUser: {
            ...prev.sessionUser,
            enabled: !prev.sessionUser.enabled,
          },
        };
      }),
    []
  );

  const updateNotifications = useCallback(async () => {
    const result = await updateNotificationsUserSetting(formId, notificationsUsers.sessionUser);
    if (result !== undefined && "error" in result) {
      toast.error(updateNotificationsError);
      return;
    }

    toast.success(updateNotificationsSuccess);
    ga("form_notifications", {
      formId,
      action: notificationsUsers.sessionUser?.enabled ? "enabled" : "disabled",
    });
  }, [
    formId,
    notificationsUsers.sessionUser,
    updateNotificationsError,
    updateNotificationsSuccess,
  ]);

  // This is a published form with email delivery or a legacy form that has no users.
  // Don't show the Notifications settings.
  if (getDeliveryOption() || !notificationsUsers.sessionUser) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.sessionUser.title")}</p>
      <p className="mb-4">{t("settings.notifications.sessionUser.description")}</p>
      <div className="mb-4">
        <NotificationsToggle
          isChecked={notificationsUsers.sessionUser.enabled}
          toggleChecked={toggleChecked}
          onLabel={t("settings.notifications.sessionUser.toggle.off")}
          offLabel={t("settings.notifications.sessionUser.toggle.on")}
          description={t("settings.notifications.sessionUser.toggle.title", {
            email: notificationsUsers.sessionUser.email,
          })}
        />
      </div>
      {notificationsUsers.users && notificationsUsers.users.length > 0 && (
        <NotificationsUsersList users={notificationsUsers.users} />
      )}
      <Button dataTestId="form-notifications-save" theme="secondary" onClick={updateNotifications}>
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
