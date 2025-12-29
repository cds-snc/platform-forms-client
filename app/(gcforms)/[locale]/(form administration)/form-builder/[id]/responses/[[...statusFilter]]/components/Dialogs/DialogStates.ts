export const DialogStates = {
  EDITING: "EDITING",
  SENDING: "SENDING",
  SENT: "SENT",
  MIN_ERROR: "MIN_ERROR",
  MAX_ERROR: "MAX_ERROR",
  FORMAT_ERROR: "FORMAT_ERROR",
  FAILED_ERROR: "FAILED_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  // Note: only used in ReportDialog
  DESCRIPTION_EMPTY_ERROR: "DESCRIPTION_EMPTY_ERROR",
} as const;
export type DialogStates = (typeof DialogStates)[keyof typeof DialogStates];
