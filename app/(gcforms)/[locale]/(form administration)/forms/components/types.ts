import { DeliveryOption } from "@lib/types";
import { EditLockPresenceStatus, EditLockVisibilityState } from "@root/lib/editLocks";

/**
 * Possible states a form card can be in
 */
export type CardState = "draft-editing" | "draft-readonly" | "published" | "archived";

/**
 * Edit-lock info as returned by the /api/forms/edit-locks endpoint (dates as ISO strings).
 */
export type EditLockInfoDTO = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt: string | null;
  visibilityState: EditLockVisibilityState | null;
  presenceStatus: EditLockPresenceStatus | null;
  sessionId: string | null;
};

/**
 * API response shape for edit locks
 */
export type EditLocksResponse = {
  editLocks: Record<string, EditLockInfoDTO>;
};

/**
 * Edit-lock info as held in client state (dates as Date objects).
 */
export type EditLockInfoClient = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedAt: Date;
  heartbeatAt: Date;
  expiresAt: Date;
  lastActivityAt: Date | null;
  visibilityState: EditLockVisibilityState | null;
  presenceStatus: EditLockPresenceStatus | null;
  sessionId: string | null;
};

/**
 * Server-side template summary used by the /forms dashboard.
 */
export type FormsTemplate = {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  ttl: Date | null;
  date: string;
  url: string;
  overdue: boolean;
  hasEditLock: boolean;
  isShared: boolean;
  collaboratorCount: {
    userCount: number;
    pendingUserCount: number;
  };
};

/**
 * Template enriched with edit-lock info for client rendering.
 */
export type FormsTemplateWithLockInfo = FormsTemplate & {
  editLockInfo?: EditLockInfoClient | null;
  lastEditedBy?: string | null;
};

/**
 * Possible tab statuses for filtering forms
 */
export type FormTabStatus = "recentlyEdited" | "draft" | "published" | "archived" | "closed";

/**
 * Constants for form tab status values
 */
export const TAB_STATUS = {
  RECENTLY_EDITED: "recentlyEdited",
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  CLOSED: "closed",
} as const;
