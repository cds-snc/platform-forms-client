import {
  langToLocale,
  getNumberFormatOptions,
  formatNumberForDisplay,
  normalizeLocaleInput,
  isNumericInput,
  isIntegerInput,
  formatNumericStringForDisplay,
} from "./utils";

describe("NumberInput Utils", () => {
  describe("langToLocale", () => {
    it("converts 'en' to 'en-CA'", () => {
      expect(langToLocale("en")).toBe("en-CA");
    });

    it("converts 'fr' to 'fr-CA'", () => {
      expect(langToLocale("fr")).toBe("fr-CA");
    });

    it("defaults to 'en-CA' for undefined language", () => {
      expect(langToLocale(undefined)).toBe("en-CA");
    });

    it("defaults to 'en-CA' for unknown language", () => {
      expect(langToLocale("es")).toBe("en-CA");
    });
  });

  describe("getNumberFormatOptions", () => {
    it("returns currency format when currencyCode is provided", () => {
      const options = getNumberFormatOptions({ currencyCode: "USD" });
      expect(options.style).toBe("currency");
      expect(options.currency).toBe("USD");
      expect(options.useGrouping).toBe(true);
    });

    it("returns decimal format without currency", () => {
      const options = getNumberFormatOptions({
        stepCount: 2,
        useThousandsSeparator: true,
      });
      expect(options.style).toBeUndefined();
      expect(options.minimumFractionDigits).toBe(2);
      expect(options.maximumFractionDigits).toBe(2);
      expect(options.useGrouping).toBe(true);
    });

    it("sets fraction digits to 0 when stepCount is undefined", () => {
      const options = getNumberFormatOptions({});
      expect(options.minimumFractionDigits).toBe(0);
      expect(options.maximumFractionDigits).toBe(0);
    });

    it("disables grouping when useThousandsSeparator is false", () => {
      const options = getNumberFormatOptions({
        stepCount: 2,
        useThousandsSeparator: false,
      });
      expect(options.useGrouping).toBe(false);
    });

    it("handles currency with custom stepCount", () => {
      const options = getNumberFormatOptions({
        currencyCode: "CAD",
        stepCount: 2,
      });
      expect(options.style).toBe("currency");
      expect(options.currency).toBe("CAD");
      expect(options.minimumFractionDigits).toBeUndefined();
    });
  });

  describe("formatNumberForDisplay", () => {
    it("formats number with en-CA locale without decimals or grouping", () => {
      const result = formatNumberForDisplay(1234.56, "en", {
        stepCount: 0,
      });
      expect(result).toBe("1235");
    });

    it("formats number with en-CA locale with decimals and no grouping", () => {
      const result = formatNumberForDisplay(1234.56, "en", {
        stepCount: 2,
        useThousandsSeparator: false,
      });
      expect(result).toBe("1234.56");
    });

    it("formats number with thousands separator", () => {
      const result = formatNumberForDisplay(1234.56, "en", {
        stepCount: 2,
        useThousandsSeparator: true,
      });
      expect(result).toContain("1,234");
      expect(result).toContain("56");
    });

    it("formats number with fr-CA locale", () => {
      const result = formatNumberForDisplay(1234.56, "fr", {
        stepCount: 2,
        useThousandsSeparator: true,
      });
      expect(result).toContain("1");
    });

    it("formats currency", () => {
      const result = formatNumberForDisplay(1234.56, "en", {
        currencyCode: "USD",
      });
      expect(result).toContain("$");
      expect(result).toContain("1,234");
    });

    it("returns empty string for NaN", () => {
      const result = formatNumberForDisplay(NaN, "en", {});
      expect(result).toBe("");
    });

    it("formats zero", () => {
      const result = formatNumberForDisplay(0, "en", { stepCount: 2 });
      expect(result).toContain("0");
    });

    it("formats negative numbers", () => {
      const result = formatNumberForDisplay(-1234.56, "en", {
        stepCount: 2,
      });
      expect(result).toContain("-");
    });

    it("formats BigInt values without losing precision", () => {
      const result = formatNumberForDisplay(1236545454545454545454545454n, "en", {
        useThousandsSeparator: true,
      });

      expect(result).toBe("1,236,545,454,545,454,545,454,545,454");
    });
  });

  describe("isNumericInput", () => {
    it("returns true for numeric strings", () => {
      expect(isNumericInput("1236545454545454545454545454")).toBe(true);
      expect(isNumericInput("-123.45")).toBe(true);
    });

    it("returns false for invalid numeric strings", () => {
      expect(isNumericInput("")).toBe(false);
      expect(isNumericInput("123abc")).toBe(false);
      expect(isNumericInput("12.34.56")).toBe(false);
    });
  });

  describe("isIntegerInput", () => {
    it("returns true for integer strings", () => {
      expect(isIntegerInput("1236545454545454545454545454")).toBe(true);
      expect(isIntegerInput("-1236545454545454545454545454")).toBe(true);
    });

    it("returns false for decimals and invalid strings", () => {
      expect(isIntegerInput("123.45")).toBe(false);
      expect(isIntegerInput("123abc")).toBe(false);
    });
  });

  describe("formatNumericStringForDisplay", () => {
    it("formats long integer strings without losing precision", () => {
      expect(
        formatNumericStringForDisplay("1236545454545454545454545454", "en-CA", {
          useGrouping: false,
        })
      ).toBe("1236545454545454545454545454");
    });

    it("groups long integer strings without converting them to Number", () => {
      expect(
        formatNumericStringForDisplay("1236545454545454545454545454", "en-CA", {
          useGrouping: true,
        })
      ).toBe("1,236,545,454,545,454,545,454,545,454");
    });

    it("preserves the sign when grouping negative long integers", () => {
      expect(
        formatNumericStringForDisplay("-1236545454545454545454545454", "en-CA", {
          useGrouping: true,
        })
      ).toBe("-1,236,545,454,545,454,545,454,545,454");
    });

    it("formats decimals with configured fraction digits", () => {
      expect(
        formatNumericStringForDisplay("1234.5", "en-CA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
        })
      ).toBe("1,234.50");
    });

    it("formats long decimal strings without losing precision", () => {
      expect(
        formatNumericStringForDisplay("525254542254224552445244.25", "en-CA", {
          useGrouping: false,
        })
      ).toBe("525254542254224552445244.25");
    });

    it("groups long decimal strings without losing precision", () => {
      expect(
        formatNumericStringForDisplay("525254542254224552445244.25", "en-CA", { useGrouping: true })
      ).toBe("525,254,542,254,224,552,445,244.25");
    });

    it("returns non-numeric values unchanged", () => {
      expect(formatNumericStringForDisplay("abc", "en-CA", { useGrouping: true })).toBe("abc");
    });

    it("normalizes formatted input before display", () => {
      expect(
        formatNumericStringForDisplay("1,236,545,454,545,454,545,454,545,454", "en-CA", {
          useGrouping: false,
        })
      ).toBe("1236545454545454545454545454");
    });
  });

  describe("normalizeLocaleInput", () => {
    describe("English-Canadian locale", () => {
      it("normalizes simple number", () => {
        const result = normalizeLocaleInput("123", "en-CA");
        expect(result).toBe("123");
      });

      it("removes thousands separator", () => {
        const result = normalizeLocaleInput("1,234,567", "en-CA");
        expect(result).toBe("1234567");
      });

      it("preserves decimal point", () => {
        const result = normalizeLocaleInput("123.45", "en-CA");
        expect(result).toBe("123.45");
      });

      it("handles negative numbers", () => {
        const result = normalizeLocaleInput("-1,234.56", "en-CA");
        expect(result).toBe("-1234.56");
      });

      it("removes currency symbols", () => {
        const result = normalizeLocaleInput("$1,234.56", "en-CA");
        expect(result).toBe("1234.56");
      });

      it("removes non-numeric characters except decimal and minus", () => {
        const result = normalizeLocaleInput("$1,234.56 CAD", "en-CA");
        expect(result).toBe("1234.56");
      });
    });

    describe("French-Canadian locale", () => {
      it("normalizes simple number", () => {
        const result = normalizeLocaleInput("123", "fr-CA");
        expect(result).toBe("123");
      });

      it("removes thousands separator (narrow no-break space in fr-CA)", () => {
        const frenchFormatted = "1 234";
        const result = normalizeLocaleInput(frenchFormatted, "fr-CA");
        expect(result).toBe("1234");
      });

      it("converts comma decimal to period", () => {
        const result = normalizeLocaleInput("123,45", "fr-CA");
        expect(result).toBe("123.45");
      });

      it("handles negative French formatted number", () => {
        const result = normalizeLocaleInput("-1 234,56", "fr-CA");
        expect(result).toBe("-1234.56");
      });

      it("removes French currency symbol", () => {
        const result = normalizeLocaleInput("1 234,56$", "fr-CA");
        expect(result).toBe("1234.56");
      });
    });

    describe("Edge cases", () => {
      it("handles empty string", () => {
        expect(normalizeLocaleInput("", "en-CA")).toBe("");
      });

      it("handles decimal point only", () => {
        const result = normalizeLocaleInput(".", "en-CA");
        expect(result).toBe(".");
      });

      it("handles leading decimal", () => {
        const result = normalizeLocaleInput(".5", "en-CA");
        expect(result).toBe(".5");
      });

      it("handles leading minus with decimal", () => {
        const result = normalizeLocaleInput("-.5", "en-CA");
        expect(result).toBe("-.5");
      });

      it("removes multiple decimals, keeping first", () => {
        const result = normalizeLocaleInput("12.34.56", "en-CA");
        expect(result).toContain(".");
      });

      it("handles very large numbers", () => {
        const result = normalizeLocaleInput("1,234,567,890.12", "en-CA");
        expect(result).toBe("1234567890.12");
      });

      it("strips leading/trailing spaces and special characters", () => {
        const result = normalizeLocaleInput("  $1,234.56 CAD  ", "en-CA");
        expect(result).toBe("1234.56");
      });

      it("handles zero", () => {
        const result = normalizeLocaleInput("0", "en-CA");
        expect(result).toBe("0");
      });

      it("handles formatted zero", () => {
        const result = normalizeLocaleInput("$0.00", "en-CA");
        expect(result).toBe("0.00");
      });
    });
  });
});
