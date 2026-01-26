import React from "react";
import { CheckNoBorderIcon, XIcon } from "@root/components/serverComponents/icons";
import { useTranslation } from "@root/i18n/client";
import { NotificationsUser } from "./Notifications";

export const NotificationsUsersList = ({
  userNotificationsForForm,
}: {
  userNotificationsForForm: NotificationsUser[];
}) => {
  const { t } = useTranslation("form-builder");

  if (userNotificationsForForm.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-base font-bold">{t("settings.notifications.usersList.title")}</h3>
      <p className="mb-4">{t("settings.notifications.usersList.description")}</p>

      <ul className="m-0 mb-4 list-none p-0">
        {userNotificationsForForm.map((user) => {
          return (
            <li key={user.email} className="flex h-8 items-center align-middle">
              <span className="mr-2">
                {user.enabled ? (
                  <CheckNoBorderIcon title={t("settings.notifications.usersList.enabled")} />
                ) : (
                  <XIcon title={t("settings.notifications.usersList.disabled")} />
                )}
              </span>
              {user.email}
            </li>
          );
        })}
      </ul>
    </>
  );
};
