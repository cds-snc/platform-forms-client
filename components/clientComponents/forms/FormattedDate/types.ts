export interface DateObject {
  YYYY: number;
  MM: number;
  DD: number;
}

export enum DatePart {
  DD = "day",
  MM = "month",
  YYYY = "year",
}

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY";
