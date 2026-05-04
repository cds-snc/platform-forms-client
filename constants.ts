import { kbToBytes, mbToBytes } from "@lib/utils/fileSize";

// Note 5mb is also defined for Server actions in next.config.ts
export const BODY_SIZE_LIMIT = mbToBytes(5);
export const MAX_FILE_SIZE = 10485760; // 10 MB matches file upload lambda see: generateSignedUrl
export const MAX_RESPONSE_SIZE = kbToBytes(380);

export const MAX_DYNAMIC_ROW_AMOUNT = 50;
export const MAX_CHOICE_AMOUNT = 400;

/*--------------------------------------------*
 * Edit lock and timing constants
 *--------------------------------------------*/
// Keep the edit lock alive for 5 minutes after the last successful heartbeat so brief stalls
// or delayed requests do not drop ownership while we prefer a quieter, more stable lock.
export const EDIT_LOCK_TTL_MS = 300_000;

// Only enforce edit locking when more than one assigned person could plausibly edit the form.
export const MIN_ASSIGNED_USERS_FOR_EDIT_LOCK = 2;

// Refresh the owner's lock heartbeat once per minute to reduce network noise; the longer TTL above
// provides enough slack that missing a single heartbeat should not immediately drop the lock.
export const EDIT_LOCK_HEARTBEAT_INTERVAL_MS = 60_000;

// Non-owners check lock status on the same cadence so they can notice ownership changes without
// spamming the server. This can diverge from the owner heartbeat interval later if needed.
// 60 sec
export const EDIT_LOCK_STATUS_POLL_INTERVAL_MS = 60_000;

// Client-side only: throttle local activity updates to at most once per second so rapid input does not
// churn timestamps before the next heartbeat is sent.
export const CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS = 1_000;

// After 30 seconds without local interaction, we stop calling the editor actively engaged.
export const CLIENT_SIDE_EDIT_LOCK_IDLE_MS = 30_000;

// After 2 minutes without interaction, or as soon as the tab is hidden, we treat the editor as away.
export const CLIENT_SIDE_EDIT_LOCK_AWAY_MS = 120_000;

// Surface a stale connection warning during the last 90 seconds of the longer lock TTL.
export const CLIENT_SIDE_EDIT_LOCK_STALE_THRESHOLD_MS = 90_000;

// Give the current editor a window to flush any dirty draft state before a takeover completes.
// This must be generous enough for Lambda / cold-start environments where the full
// SSE → saveDraft → ack round-trip can take several seconds.
export const EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS = 5_000;

// Toggle verbose SSE lifecycle logging
export const SHOULD_DEBUG_EDIT_LOCK_SSE = false;
