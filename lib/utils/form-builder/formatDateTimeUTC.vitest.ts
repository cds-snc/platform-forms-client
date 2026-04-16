import { formatDateTimeUTC, formatDateTimeUTCFr } from "./index";

describe("Format to UTC", () => {
  it("formats timestamp to UTC without seconds", () => {
    const timestamp = Date.UTC(2023, 9, 1, 12, 30); // October 1, 2023, 12:30 UTC
    expect(formatDateTimeUTC(timestamp)).toEqual("2023-10-01 12:30 UTC");
  });

  it("formats timestamp to UTC with seconds", () => {
    const timestamp = Date.UTC(2023, 9, 1, 12, 30, 45); // October 1, 2023, 12:30:45 UTC
    expect(formatDateTimeUTC(timestamp, true)).toEqual("2023-10-01 12:30:45 UTC");
  });

  it("handles undefined timestamp gracefully", () => {
    const result = formatDateTimeUTC(undefined);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$/);
  });

  it("handles undefined timestamp with seconds", () => {
    const result = formatDateTimeUTC(undefined, true);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/);
  });
});

describe("Format to UTC FR", () => {
  it("formats timestamp to UTC in French without seconds", () => {
    const timestamp = Date.UTC(2023, 9, 1, 12, 30); // October 1, 2023, 12:30 UTC
    expect(formatDateTimeUTCFr(timestamp)).toEqual("2023-10-01 12h 30 UTC");
  });

  it("formats timestamp to UTC in French with seconds", () => {
    const timestamp = Date.UTC(2023, 9, 1, 12, 30, 45); // October 1, 2023, 12:30:45 UTC
    expect(formatDateTimeUTCFr(timestamp)).toEqual("2023-10-01 12h 30 UTC");
  });

  it("handles undefined timestamp gracefully in French", () => {
    const result = formatDateTimeUTCFr(undefined);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}h \d{2} UTC$/);
  });

  it("handles undefined timestamp with seconds in French", () => {
    const result = formatDateTimeUTCFr(undefined);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}h \d{2} UTC$/);
  });
});
