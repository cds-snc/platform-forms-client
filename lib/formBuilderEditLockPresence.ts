// Keep the edit lock alive for 5 minutes after the last successful heartbeat so brief stalls
// or delayed requests do not drop ownership while we prefer a quieter, more stable lock.
export const EDIT_LOCK_TTL_MS = 300_000;

// Only enforce edit locking when more than one assigned person could plausibly edit the form.
export const MIN_ASSIGNED_USERS_FOR_EDIT_LOCK = 2;

// Wrap presence detection behind a single switch so the lock can fall back to the simpler editing-only UX.
export const EDIT_LOCK_DETECT_PRESENCE = true;

// Use leader tab coordination so only the foreground tab sends edit-lock heartbeats,
// reducing redundant requests when multiple tabs have the same form open.
export const EDIT_LOCK_LEADER_TAB_ENABLED = true;

// Refresh the owner's lock heartbeat once per minute to reduce network noise; the longer TTL above
// provides enough slack that missing a single heartbeat should not immediately drop the lock.
export const EDIT_LOCK_HEARTBEAT_INTERVAL_MS = 60_000;

// Non-owners check lock status on the same cadence so they can notice ownership changes without
// spamming the server. This can diverge from the owner heartbeat interval later if needed.
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

// Recompute the banner's relative-time copy every 5 seconds while presence detection is visible.
export const CLIENT_SIDE_EDIT_LOCK_TIME_TICK_MS = 5_000;

// Give the current editor a window to flush any dirty draft state before a takeover completes.
// This must be generous enough for Lambda / cold-start environments where the full
// SSE → saveDraft → ack round-trip can take several seconds.
export const EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS = 5_000;
