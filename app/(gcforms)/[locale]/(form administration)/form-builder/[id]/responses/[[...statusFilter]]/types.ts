// Should match VaultStatus structure
export const StatusFilter = {
  NEW: "new",
  DOWNLOADED: "downloaded",
  CONFIRMED: "confirmed",
  PROBLEM: "problem",
} as const;
export type StatusFilter = (typeof StatusFilter)[keyof typeof StatusFilter];
