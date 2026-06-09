/**
 * Number of cards to render per batch for infinite scroll
 */
export const CARDS_PER_BATCH = 20;

/**
 * Distance in pixels before the sentinel to start loading more cards
 */
export const INFINITE_SCROLL_ROOT_MARGIN = "200px";

/**
 * Number of days before TTL expiration to show warning
 */
export const TTL_WARNING_DAYS = 5;

/**
 * Milliseconds in a day (for date calculations)
 */
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Polling interval for edit-lock updates on the /forms dashboard.
 */
export const EDIT_LOCK_POLL_INTERVAL_MS = 5000;
