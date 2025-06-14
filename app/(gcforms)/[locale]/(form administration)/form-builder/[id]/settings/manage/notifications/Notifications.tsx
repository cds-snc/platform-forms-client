"use client";
// Above to avoid an error. Needed because a useEffect forces a client context but a server icon
// is used below. Even though the parent component has a declaration an explicit one is requred.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsToggle } from "./NotificationsToggle";
import { Button } from "@clientComponents/globals";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { getNotificationsUsersAndSettings, saveNotificationsSettings } from "./actions";
import { CheckNoBorderIcon, XIcon } from "@root/components/serverComponents/icons";

export const Notifications = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const generalError = t("settings.notifications.error.general");
  const updateNotificationsError = t("settings.notifications.error.updateNotifications");
  const updateNotificationsSuccess = t("settings.notifications.success.updateNotifications");

  const [users, setUsers] = useState<{ email: string; enabled: boolean }[] | null>(null);
  const [sessionUser, setSessionUser] = useState<{ email: string; enabled: boolean } | null>(null);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const notificationsSettings = await getNotificationsUsersAndSettings(formId);
        if ("error" in notificationsSettings || !notificationsSettings) {
          throw new Error();
        }

        // Only update if users are added to the form. Some older forms may not have any users.
        if (notificationsSettings.users && notificationsSettings.users.length > 0) {
          setUsers(notificationsSettings.users);
        }
        if (notificationsSettings.sessionUser) {
          setSessionUser(notificationsSettings.sessionUser);
        }
      } catch (error) {
        toast.error(generalError);
      }
    };
    getSettings();
  }, [formId, generalError]);

  // TODO: remove from template store: setNotificationsInterval, notificationsInterval
  const { getDeliveryOption } = useTemplateStore((s) => ({
    getDeliveryOption: s.getDeliveryOption,
  }));

  const toggleChecked = useCallback(
    () =>
      setSessionUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          enabled: !prev.enabled,
        };
      }),
    []
  );

  const updateNotifications = useCallback(async () => {
    const result = await saveNotificationsSettings(formId, sessionUser);
    if (result && !result.error) {
      ga("form_notifications", {
        formId,
        action: sessionUser?.enabled ? "enabled" : "disabled",
      });
      toast.success(updateNotificationsSuccess);
    } else {
      toast.error(updateNotificationsError);
    }
  }, [formId, sessionUser, updateNotificationsError, updateNotificationsSuccess]);

  // This is a published form with email delivery. Don't show notifications settings.
  if (getDeliveryOption()) {
    return null;
  }

  return (
    <div className="mb-10" data-testid="form-notifications">
      <h2>{t("settings.notifications.title")}</h2>
      <p className="mb-2 font-bold">{t("settings.notifications.sessionUser.title")}</p>
      <p className="mb-4">{t("settings.notifications.sessionUser.description")}</p>
      {sessionUser ? (
        <div className="mb-4">
          <NotificationsToggle
            isChecked={sessionUser.enabled}
            toggleChecked={toggleChecked}
            onLabel={t("settings.notifications.sessionUser.toggle.off")}
            offLabel={t("settings.notifications.sessionUser.toggle.on")}
            description={t("settings.notifications.sessionUser.toggle.title", {
              email: sessionUser.email,
            })}
            // disabled={!isVault}
          />
        </div>
      ) : (
        <div className="mb-4">
          <em>{t("settings.notifications.sessionUser.noSessionUser")}</em>
        </div>
      )}
      {users && users.length > 0 && (
        <>
          <p className="mb-2 font-bold">{t("settings.notifications.usersList.title")}</p>
          <ul className="m-0 mb-4 list-none p-0">
            {users.map((notificationUser) => {
              return (
                <li key={notificationUser.email} className="flex h-8 items-center align-middle">
                  <span className="mr-2">
                    {notificationUser.enabled ? (
                      <CheckNoBorderIcon title={t("settings.notifications.usersList.enabled")} />
                    ) : (
                      <XIcon title={t("settings.notifications.usersList.disabled")} />
                    )}
                  </span>
                  {notificationUser.email}
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Button
        dataTestId="form-notifications-save"
        theme="secondary"
        onClick={updateNotifications}
        // disabled={!isVault}
      >
        {t("settings.notifications.save")}
      </Button>
    </div>
  );
};
