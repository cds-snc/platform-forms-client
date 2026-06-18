import { DeliveryOption } from "@lib/types";
import { EditLockPresenceStatus, EditLockVisibilityState } from "@root/lib/editLocks";

/**
 * Possible states a form card can be in
 */
export type CardState = "draft-editing" | "draft-readonly" | "published" | "archived" | "closed";

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
  hasDraft: boolean;
  currentDraftVersion?: number;
  versionNumber?: number | null;
  ttl: Date | null;
  date: string;
  overdue: boolean;
  hasEditLock: boolean;
  collaboratorCount: {
    userCount: number;
    pendingUserCount: number;
  };
  closingDate?: Date | null;
  lastEditedBy?: string | null;
};

/**
 * Template merged with edit-lock info for client rendering.
 */
export type FormsTemplateWithLockInfo = FormsTemplate & {
  editLockInfo?: EditLockInfoClient | null;
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

/**
 * Constants for card state values
 */
export const CARD_STATE = {
  DRAFT_EDITING: "draft-editing",
  DRAFT_READONLY: "draft-readonly",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  CLOSED: "closed",
} as const;
