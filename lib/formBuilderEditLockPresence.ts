// Keep the edit lock alive for 60 seconds after the last successful heartbeat.
export const EDIT_LOCK_TTL_MS = 60_000;

// Only enforce edit locking when more than one assigned person could plausibly edit the form.
export const MIN_ASSIGNED_USERS_FOR_EDIT_LOCK = 2;

// Wrap presence detection behind a single switch so the lock can fall back to the simpler editing-only UX.
export const EDIT_LOCK_DETECT_PRESENCE = true;

// Refresh the lock every 10 seconds, staying well inside the 60 second lock TTL.
export const EDIT_LOCK_HEARTBEAT_MS = 10_000;

// Client-side only: throttle local activity updates to at most once per second so rapid input does not
// churn timestamps before the next heartbeat is sent.
export const CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS = 1_000;

// After 30 seconds without local interaction, we stop calling the editor actively engaged.
export const CLIENT_SIDE_EDIT_LOCK_IDLE_MS = 30_000;

// After 2 minutes without interaction, or as soon as the tab is hidden, we treat the editor as away.
export const CLIENT_SIDE_EDIT_LOCK_AWAY_MS = 120_000;

// Surface a stale connection warning shortly before the 60 second lock TTL expires.
export const CLIENT_SIDE_EDIT_LOCK_STALE_THRESHOLD_MS = 15_000;

// Recompute the banner's relative-time copy every 5 seconds while presence detection is visible.
export const CLIENT_SIDE_EDIT_LOCK_TIME_TICK_MS = 5_000;

// Give the current editor a window to flush any dirty draft state before a takeover completes.
// This must be generous enough for Lambda / cold-start environments where the full
// SSE → saveDraft → ack round-trip can take several seconds.
export const EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS = 5_000;
