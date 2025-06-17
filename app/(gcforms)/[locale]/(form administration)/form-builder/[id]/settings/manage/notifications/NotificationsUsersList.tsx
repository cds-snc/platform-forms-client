import { CheckNoBorderIcon, XIcon } from "@root/components/serverComponents/icons";
import { useTranslation } from "@root/i18n/client";
import { NotificationsUser } from "./Notifications";

export const NotificationsUsersList = ({ users }: { users: NotificationsUser[] }) => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <p className="mb-2 font-bold">{t("settings.notifications.usersList.title")}</p>
      <ul className="m-0 mb-4 list-none p-0">
        {users.map((user) => {
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
