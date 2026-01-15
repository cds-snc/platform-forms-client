import React from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsToggle } from "./NotificationsToggle";

export const NotificationsUserSetting = ({
  userHasNotificationsEnabled,
  loggedInUser,
  onToggle,
}: {
  userHasNotificationsEnabled: boolean;
  loggedInUser: { id: string; email: string };
  onToggle: (enabled: boolean) => Promise<void>;
}) => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <h3 className="text-base font-bold">{t("settings.notifications.sessionUser.title")}</h3>
      <p className="mb-4">{t("settings.notifications.sessionUser.description")}</p>
      <NotificationsToggle
        className="mb-4"
        userHasNotificationsEnabled={userHasNotificationsEnabled}
        toggleChecked={onToggle}
        onLabel={t("settings.notifications.sessionUser.toggle.off")}
        offLabel={t("settings.notifications.sessionUser.toggle.on")}
        description={t("settings.notifications.sessionUser.toggle.title", {
          email: loggedInUser.email,
        })}
      ></NotificationsToggle>
    </>
  );
};
