export const HeadingLevel = {
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
} as const;

export type HeadingLevel = (typeof HeadingLevel)[keyof typeof HeadingLevel];

export const ErrorStatus = {
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
  INFO: "INFO",
} as const;

export type ErrorStatus = (typeof ErrorStatus)[keyof typeof ErrorStatus];
