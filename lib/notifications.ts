import { NotificationsInterval } from "@gcforms/types";

export const validateNotificationsInterval = (
  notificationsInterval: number | null | undefined
): notificationsInterval is NotificationsInterval => {
  return Object.values(NotificationsInterval).includes(
    notificationsInterval as NotificationsInterval
  );
};
