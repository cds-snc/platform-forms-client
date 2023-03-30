export enum NagLevel {
  None,
  UnsavedSubmissionsOver21DaysOld,
  UnconfirmedSubmissionsOver21DaysOld,
  UnsavedSubmissionsOver35DaysOld,
  UnconfirmedSubmissionsOver35DaysOld,
}

export type NagwareSubmission = {
  status: string;
  createdAt: number;
};

export type NagwareResult = {
  level: NagLevel;
  numberOfSubmissions: number;
};
