import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckNoBorderIcon, XIcon } from "@root/components/serverComponents/icons";
import { useTranslation } from "@root/i18n/client";
import { NotificationsUser } from "./Notifications";
import { getNotificationsUsersList } from "./actions";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";

export const NotificationsUsersList = ({ formId }: { formId: string }) => {
  const { data } = useSession();
  const { t } = useTranslation("form-builder");
  const generalError = t("settings.notifications.error.getNotifcations");
  const [users, setUsers] = useState<NotificationsUser[] | null>(null);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const usersWithSessionUser = await getNotificationsUsersList(formId);
        if (!usersWithSessionUser || "error" in usersWithSessionUser) {
          throw new Error();
        }

        const usersWithoutSessionUser =
          usersWithSessionUser.filter((user) => user.id !== data?.user.id) || null;
        setUsers(usersWithoutSessionUser);
      } catch (error) {
        toast.error(generalError);
      }
    };
    getSettings();
  }, [formId, generalError, data?.user.id]);

  if (!users) {
    return <Skeleton count={3} className="mb-4" width={300} height={20} />;
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-base font-bold">{t("settings.notifications.usersList.title")}</h3>
      <p className="mb-4">{t("settings.notifications.usersList.description")}</p>
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
