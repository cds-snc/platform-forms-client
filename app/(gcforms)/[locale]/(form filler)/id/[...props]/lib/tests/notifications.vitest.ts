import { NotificationsInterval } from "@gcforms/types";
import { validateNotificationsInterval } from "@lib/notifications";

const validIntervals = [
  NotificationsInterval.DAY,
  NotificationsInterval.WEEK,
  NotificationsInterval.OFF,
];

const invalidIntervals = [undefined, 0, "0", "day", "INVALID_INTERVAL", {}];

describe("verifyNotificationsInterval", () => {
  it("should return true for valid notifications intervals", () => {
    validIntervals.forEach((interval) => {
      expect(validateNotificationsInterval(interval)).toBe(true);
    });
  });
  it("should return false for invalid notifications intervals", () => {
    invalidIntervals.forEach((interval) => {
      expect(validateNotificationsInterval(interval as NotificationsInterval)).toBe(false);
    });
  });
});
