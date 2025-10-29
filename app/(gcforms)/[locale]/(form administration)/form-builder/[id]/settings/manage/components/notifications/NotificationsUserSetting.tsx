import { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { NotificationsUser } from "./Notifications";
import { NotificationsToggle } from "./NotificationsToggle";
import Skeleton from "react-loading-skeleton";

export const NotificationsUserSetting = ({
  sessionUser,
  onToggle,
}: {
  sessionUser: NotificationsUser | null;
  onToggle: (enabled: boolean) => Promise<void>;
}) => {
  const { t } = useTranslation("form-builder");

  const toggleChecked = useCallback(() => {
    if (!sessionUser) return;
    const newEnabled = !sessionUser.enabled;
    onToggle(newEnabled);
  }, [sessionUser, onToggle]);

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
