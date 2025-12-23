import { VaultStatus } from "./retrieval-types";

export const NagLevel = {
  None: "None",
  UnsavedSubmissionsOver21DaysOld: "UnsavedSubmissionsOver21DaysOld",
  UnconfirmedSubmissionsOver21DaysOld: "UnconfirmedSubmissionsOver21DaysOld",
  UnsavedSubmissionsOver35DaysOld: "UnsavedSubmissionsOver35DaysOld",
  UnconfirmedSubmissionsOver35DaysOld: "UnconfirmedSubmissionsOver35DaysOld",
} as const;
export type NagLevel = (typeof NagLevel)[keyof typeof NagLevel];

export type NagwareSubmission = {
  status: VaultStatus;
  createdAt: number;
};

export type NagwareResult = {
  level: NagLevel;
  numberOfSubmissions: number;
};
