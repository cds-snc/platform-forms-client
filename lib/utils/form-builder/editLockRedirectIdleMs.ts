const DEFAULT_EDIT_LOCK_REDIRECT_IDLE_MS = 1_800_000;

export const normalizeEditLockRedirectIdleMs = (value: number | string | null | undefined) => {
  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_EDIT_LOCK_REDIRECT_IDLE_MS;
};
