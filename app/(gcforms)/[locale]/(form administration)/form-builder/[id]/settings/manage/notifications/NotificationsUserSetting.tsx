import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";
import { NotificationsUser } from "./Notifications";
import { NotificationsToggle } from "./NotificationsToggle";
import { getNotificationsUser } from "./actions";
import Skeleton from "react-loading-skeleton";

export const NotificationsUserSetting = ({
  formId,
  sessionUser,
  setSessionUser,
}: {
  formId: string;
  sessionUser: NotificationsUser | null;
  setSessionUser: Dispatch<SetStateAction<NotificationsUser | null>>;
}) => {
  const { t } = useTranslation("form-builder");
  const generalError = t("settings.notifications.error.getNotifcations");

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
  }, [formId, generalError, setSessionUser]);

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
    [sessionUser?.enabled, setSessionUser]
  );

  if (!sessionUser) {
    return <Skeleton count={1} className="mb-4" width={300} height={20} />;
  }

  return (
    <>
      <h3 className="text-base font-bold">{t("settings.notifications.sessionUser.title")}</h3>
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
      ></NotificationsToggle>
    </>
  );
};
