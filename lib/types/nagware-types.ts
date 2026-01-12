import { VaultStatus } from "./retrieval-types";

export const NagLevel = {
  None: 0,
  UnsavedSubmissionsOver21DaysOld: 1,
  UnconfirmedSubmissionsOver21DaysOld: 2,
  UnsavedSubmissionsOver35DaysOld: 3,
  UnconfirmedSubmissionsOver35DaysOld: 4,
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
