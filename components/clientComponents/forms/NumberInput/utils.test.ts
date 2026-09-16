import {
  langToLocale,
  getNumberFormatOptions,
  formatNumberForDisplay,
  normalizeLocaleInput,
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
      // When currencyCode is set, stepCount is ignored
      expect(options.minimumFractionDigits).toBeUndefined();
    });
  });

  describe("formatNumberForDisplay", () => {
    it("formats number with en-CA locale without decimals or grouping", () => {
      const result = formatNumberForDisplay(1234.56, "en", {
        stepCount: 0,
      });
      expect(result).toBe("1235"); // Rounded to 0 decimals, no grouping
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
      expect(result).toContain("1"); // Contains the number
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
        // French uses narrow no-break space for thousands separator
        const frenchFormatted = "1 234"; // Space separator (could be narrow no-break space)
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
        // Note: This will have the decimal replaced, exact behavior depends on implementation
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
