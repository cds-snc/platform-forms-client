import { DeliveryOption } from "@lib/types";
import { EditLockPresenceStatus, EditLockVisibilityState } from "@root/lib/editLocks";

/**
 * Possible states a form card can be in
 */
export type CardState = "draft-editing" | "draft-readonly" | "published" | "archived";

/**
 * Edit lock information returned from the API
 */
export type EditLockInfo = {
  lockedByUserId: string;
  lockedByName: string | null;
  lockedByEmail: string | null;
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt: string | null;
  visibilityState: "visible" | "hidden" | null;
  presenceStatus: "active" | "idle" | "away" | null;
  sessionId: string | null;
};

/**
 * API response shape for edit locks
 */
export type EditLocksResponse = {
  editLocks: Record<string, EditLockInfo>;
};

/**
 * Base card interface
 */
export interface CardData {
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
  hasEditLock?: boolean;
  isShared: boolean;
  status?: string;
}

/**
 * Card data with edit lock and collaborator information
 */
export type CardWithLockInfo = CardData & {
  collaboratorCount: {
    userCount: number;
    pendingUserCount: number;
  };
  editLockInfo?: {
    lockedByUserId: string;
    lockedByName: string | null;
    lockedByEmail: string | null;
    lockedAt: Date;
    heartbeatAt: Date;
    expiresAt: Date;
    lastActivityAt: Date | null;
    visibilityState: EditLockVisibilityState | null;
    presenceStatus: EditLockPresenceStatus | null;
    sessionId: string | null;
  } | null;
};
