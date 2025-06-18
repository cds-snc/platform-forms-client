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

  const [users, setUsers] = useState<NotificationsUser[] | null>(null);
  const [sessionUserWithSetting, setSessionUserWithSetting] = useState<NotificationsUser | null>(
    null
  );
  const usersWithoutSessionUser = users?.filter((user) => user.id !== data?.user.id);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const users = await getNotificationsUsers(formId);
        if ("error" in users || !users) {
          throw new Error();
        }
        setUsers(users);

        const sessionUserWithSetting = users.find((user) => user.id === data?.user.id) || null;
        setSessionUserWithSetting(sessionUserWithSetting);
      } catch (error) {
        toast.error(generalError);
      }
    };
    getSettings();
  }, [formId, generalError, data?.user]);

  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  const toggleChecked = useCallback(
    () =>
      setSessionUserWithSetting((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          enabled: !prev.enabled,
        };
      }),
    []
  );

  const updateNotifications = useCallback(async () => {
    const result = await updateNotificationsUserSetting(formId, sessionUserWithSetting);
    // TODO better way to do this?
    if (result !== undefined && "error" in result) {
      toast.error(updateNotificationsError);
    } else {
      ga("form_notifications", {
        formId,
        action: sessionUserWithSetting?.enabled ? "enabled" : "disabled",
      });
      toast.success(updateNotificationsSuccess);
    }
  }, [formId, sessionUserWithSetting, updateNotificationsError, updateNotificationsSuccess]);

  // This is a published form with email delivery or a legacy form that has no users.
  // Don't show notifications settings.
  if (getDeliveryOption() || !sessionUserWithSetting) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.sessionUser.title")}</p>
      <p className="mb-4">{t("settings.notifications.sessionUser.description")}</p>
      <div className="mb-4">
        <NotificationsToggle
          isChecked={sessionUserWithSetting.enabled}
          toggleChecked={toggleChecked}
          onLabel={t("settings.notifications.sessionUser.toggle.off")}
          offLabel={t("settings.notifications.sessionUser.toggle.on")}
          description={t("settings.notifications.sessionUser.toggle.title", {
            email: sessionUserWithSetting.email,
          })}
        />
      </div>
      {usersWithoutSessionUser && usersWithoutSessionUser.length > 0 && (
        <NotificationsUsersList users={usersWithoutSessionUser} />
      )}
      <Button dataTestId="form-notifications-save" theme="secondary" onClick={updateNotifications}>
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
