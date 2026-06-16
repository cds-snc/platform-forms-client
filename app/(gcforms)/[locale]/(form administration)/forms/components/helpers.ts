import { FormsTemplateWithLockInfo, CardState } from "./types";
import { TTL_WARNING_DAYS, MILLISECONDS_PER_DAY } from "./constants";

/**
 * Determines the current state of a card based on its properties
 */
export function getCardState(card: FormsTemplateWithLockInfo): CardState {
  if (card.closingDate && new Date(card.closingDate) <= new Date()) return "closed";
  if (card.ttl) return "archived";
  if (card.isPublished) return "published";
  if (card.editLockInfo) return "draft-editing";
  return "draft-readonly";
}

/**
 * Formats a date string to YYYY-MM-DD format
 */
export function formatDateToYYYYMMDD(date: string | Date): string {
  const jsDate = typeof date === "string" ? new Date(date) : date;
  return jsDate.toISOString().split("T")[0];
}

/**
 * Calculates the number of days until a TTL date
 */
export function daysUntilTTL(ttl: Date): number {
  return Math.ceil((ttl.getTime() - new Date().getTime()) / MILLISECONDS_PER_DAY);
}

/**
 * Checks if TTL date is within the warning threshold
 */
export function isTTLWarningPeriod(ttl: Date): boolean {
  const daysRemaining = daysUntilTTL(ttl);
  return daysRemaining > 0 && daysRemaining <= TTL_WARNING_DAYS;
}

/**
 * Calculates the total collaborator count (excluding the owner)
 */
export function calculateCollaboratorCount(userCount: number, pendingUserCount: number): number {
  // userCount includes the owner, so we subtract 1
  return userCount - 1 + pendingUserCount;
}
