import { describe, expect, it, vi, beforeEach } from "vitest";

import { formatNumberInputAnswer } from "./formatNumberInputAnswer";
import { FormElementTypes, FormRecord } from "@lib/types";
import { formatNumberForDisplay } from "@clientComponents/forms/NumberInput/utils";
import { getElementOrSubElementById } from "@gcforms/core";

vi.mock("@clientComponents/forms/NumberInput/utils", () => ({
  formatNumberForDisplay: vi.fn(),
}));

vi.mock("@gcforms/core", () => ({
  getElementOrSubElementById: vi.fn(),
}));

describe("formatNumberInputAnswer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined for non-number inputs", () => {
    const formRecord = { form: { elements: [] } } as unknown as FormRecord;
    const result = formatNumberInputAnswer(
      {
        questionId: 1,
        questionEn: "Question",
        questionFr: "Question",
        answer: "plain text",
        type: FormElementTypes.textField,
      },
      "en",
      formRecord
    );

    expect(result).toBeUndefined();
    expect(getElementOrSubElementById).not.toHaveBeenCalled();
    expect(formatNumberForDisplay).not.toHaveBeenCalled();
  });

  it("formats number input using element options", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: {
        currencyCode: "CAD",
        stepCount: 2,
        useThousandsSeparator: true,
      },
    } as ReturnType<typeof getElementOrSubElementById>);
    vi.mocked(formatNumberForDisplay).mockReturnValue("$1,234.50");

    const formRecord = { form: { elements: [] } } as unknown as FormRecord;
    const result = formatNumberInputAnswer(
      {
        questionId: 42,
        questionEn: "Amount",
        questionFr: "Montant",
        answer: "1234.5",
        type: FormElementTypes.numberInput,
      },
      "en",
      formRecord
    );

    expect(getElementOrSubElementById).toHaveBeenCalledWith(formRecord.form.elements, "42");
    expect(formatNumberForDisplay).toHaveBeenCalledWith(1234.5, "en", {
      currencyCode: "CAD",
      stepCount: 2,
      useThousandsSeparator: true,
    });
    expect(result).toBe("$1,234.50");
  });

  it("falls back to the raw answer when the value cannot be parsed as a number", () => {
    vi.mocked(getElementOrSubElementById).mockReturnValue({
      properties: {},
    } as ReturnType<typeof getElementOrSubElementById>);

    const formRecord = { form: { elements: [] } } as unknown as FormRecord;
    const result = formatNumberInputAnswer(
      {
        questionId: 7,
        questionEn: "Amount",
        questionFr: "Montant",
        answer: "not a number",
        type: FormElementTypes.numberInput,
      },
      "en",
      formRecord
    );

    expect(result).toBe("not a number");
    expect(formatNumberForDisplay).not.toHaveBeenCalled();
  });
});
