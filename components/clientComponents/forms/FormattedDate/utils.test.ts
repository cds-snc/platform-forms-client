import {
  getFormattedDateFromObject,
  isValidDate,
  isLeapYear,
  getMaxMonthDay,
  isValidDateObject,
} from "./utils";
import { DateFormat, DateObject } from "./types";

describe("getFormattedDateFromObject", () => {
  const dateObject: DateObject = { YYYY: 2023, MM: 5, DD: 15 };

  it("formats date correctly with default format (YYYY-MM-DD)", () => {
    expect(getFormattedDateFromObject(undefined, dateObject)).toBe("2023-05-15");
  });

  it("formats date correctly with YYYY-MM-DD format", () => {
    expect(getFormattedDateFromObject("YYYY-MM-DD", dateObject)).toBe("2023-05-15");
  });

  it("formats date correctly with DD-MM-YYYY format", () => {
    expect(getFormattedDateFromObject("DD-MM-YYYY", dateObject)).toBe("15-05-2023");
  });

  it("formats date correctly with MM-DD-YYYY format", () => {
    expect(getFormattedDateFromObject("MM-DD-YYYY", dateObject)).toBe("05-15-2023");
  });

  it("pads single-digit month and day with zeros", () => {
    const singleDigitDate: DateObject = { YYYY: 2023, MM: 1, DD: 1 };
    expect(getFormattedDateFromObject("YYYY-MM-DD", singleDigitDate)).toBe("2023-01-01");
    expect(getFormattedDateFromObject("DD-MM-YYYY", singleDigitDate)).toBe("01-01-2023");
    expect(getFormattedDateFromObject("MM-DD-YYYY", singleDigitDate)).toBe("01-01-2023");
  });

  it("uses YYYY-MM-DD format for invalid format strings", () => {
    expect(getFormattedDateFromObject("INVALID-FORMAT" as DateFormat, dateObject)).toBe(
      "2023-05-15"
    );
    expect(getFormattedDateFromObject("YY-MM-DD" as DateFormat, dateObject)).toBe("2023-05-15");
    expect(getFormattedDateFromObject("YYYY/MM/DD" as DateFormat, dateObject)).toBe("2023-05-15");
  });

  it('returns "-" for invalid date objects', () => {
    expect(getFormattedDateFromObject("YYYY-MM-DD", {} as DateObject)).toBe("-");
    expect(getFormattedDateFromObject("YYYY-MM-DD", { YYYY: 2023 } as DateObject)).toBe("-");
    expect(getFormattedDateFromObject("YYYY-MM-DD", { YYYY: 2023, MM: 5 } as DateObject)).toBe("-");
  });
});

describe("isValidDate", () => {
  it("returns true for valid dates", () => {
    expect(isValidDate({ YYYY: 2023, MM: 5, DD: 15 })).toBe(true);
    expect(isValidDate({ YYYY: 2024, MM: 2, DD: 29 })).toBe(true); // Leap year
  });

  it("returns false for invalid dates", () => {
    expect(isValidDate({ YYYY: 2023, MM: 2, DD: 30 })).toBe(false);
    expect(isValidDate({ YYYY: 2023, MM: 13, DD: 1 })).toBe(false);
  });

  it("returns true for December 31", () => {
    expect(isValidDate({ YYYY: 2023, MM: 12, DD: 31 })).toBe(true);
  });
});

describe("isLeapYear", () => {
  it("correctly identifies leap years", () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
  });

  it("correctly identifies non-leap years", () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe("getMaxMonthDay", () => {
  it("returns correct days for 31-day months", () => {
    expect(getMaxMonthDay(1, 2023)).toBe(31);
    expect(getMaxMonthDay(12, 2023)).toBe(31);
  });

  it("returns correct days for 30-day months", () => {
    expect(getMaxMonthDay(4, 2023)).toBe(30);
    expect(getMaxMonthDay(11, 2023)).toBe(30);
  });

  it("returns correct days for February in non-leap years", () => {
    expect(getMaxMonthDay(2, 2023)).toBe(28);
  });

  it("returns correct days for February in leap years", () => {
    expect(getMaxMonthDay(2, 2024)).toBe(29);
  });
});

describe("isValidDateObject", () => {
  it("returns true for valid DateObjects", () => {
    expect(isValidDateObject({ YYYY: 2023, MM: 5, DD: 15 })).toBe(true);
    expect(isValidDateObject({ YYYY: 2000, MM: 1, DD: 1 })).toBe(true);
  });

  it("returns false for non-object inputs", () => {
    expect(isValidDateObject(null)).toBe(false);
    expect(isValidDateObject(undefined)).toBe(false);
    expect(isValidDateObject("2023-05-15")).toBe(false);
    expect(isValidDateObject(42)).toBe(false);
  });

  it("returns false for objects missing required properties", () => {
    expect(isValidDateObject({})).toBe(false);
    expect(isValidDateObject({ YYYY: 2023 })).toBe(false);
    expect(isValidDateObject({ YYYY: 2023, MM: 5 })).toBe(false);
    expect(isValidDateObject({ MM: 5, DD: 15 })).toBe(false);
  });

  it("returns false for objects with incorrect property types", () => {
    expect(isValidDateObject({ YYYY: "2023", MM: 5, DD: 15 })).toBe(false);
    expect(isValidDateObject({ YYYY: 2023, MM: "05", DD: 15 })).toBe(false);
    expect(isValidDateObject({ YYYY: 2023, MM: 5, DD: "15" })).toBe(false);
  });

  it("returns true for objects with additional properties", () => {
    expect(isValidDateObject({ YYYY: 2023, MM: 5, DD: 15, extra: "property" })).toBe(true);
  });
});
