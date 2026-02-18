export interface DateObject {
  YYYY: number;
  MM: number;
  DD: number;
}

export const DatePart = {
  DD: "day",
  MM: "month",
  YYYY: "year",
} as const;
export type DatePart = (typeof DatePart)[keyof typeof DatePart];

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY";
