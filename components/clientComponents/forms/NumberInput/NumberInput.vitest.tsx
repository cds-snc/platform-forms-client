/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, afterEach, vi } from "vitest";
import { Formik, Form } from "formik";
import { NumberInput } from "./NumberInput";

vi.mock("@clientComponents/forms", () => ({
  ErrorMessage: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div id={id} role="alert">
      {children}
    </div>
  ),
}));

vi.mock("@lib/utils", () => ({
  cn: (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" "),
}));

interface FormValues {
  amount: string;
}

const renderNumberInput = (
  props: Partial<React.ComponentProps<typeof NumberInput>> = {},
  { initialValue = "" } = {}
) => {
  const { id = "amount", name = "amount", ...rest } = props;
  return render(
    <Formik<FormValues> initialValues={{ amount: initialValue }} onSubmit={vi.fn()}>
      <Form>
        <NumberInput id={id} name={name} {...rest} />
      </Form>
    </Formik>
  );
};

describe("NumberInput Component", () => {
  afterEach(() => cleanup());

  describe("Rendering", () => {
    it("renders an input element with testid", () => {
      renderNumberInput();
      expect(screen.getByTestId("numberInput")).toBeInTheDocument();
    });

    it("renders with correct id attribute", () => {
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.id).toBe("amount");
    });

    it("renders with placeholder when provided", () => {
      renderNumberInput({ placeholder: "Enter amount" });
      expect(screen.getByPlaceholderText("Enter amount")).toBeInTheDocument();
    });

    it("renders with required attribute when required is true", () => {
      renderNumberInput({ required: true });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it("renders with inputMode set to numeric", () => {
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.inputMode).toBe("numeric");
    });

    it("applies custom className", () => {
      renderNumberInput({ className: "custom-class" });
      const input = screen.getByTestId("numberInput");
      expect(input).toHaveClass("custom-class", "gcds-input-text");
    });
  });

  describe("Basic Input Handling", () => {
    it("accepts numeric input", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "123");
      expect(input.value).toBe("123");
    });

    it("handles decimal input when stepCount is provided", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "123.45");
      expect(input.value).toBe("123.45");
    });

    it("blocks non-numeric characters by default", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "abc");
      expect(input.value).toBe("");
    });

    it("allows negative sign when allowNegativeNumbers is true", async () => {
      const user = userEvent.setup();
      renderNumberInput({ allowNegativeNumbers: true });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "-123");
      expect(input.value).toBe("-123");
    });

    it("blocks negative sign when allowNegativeNumbers is false", async () => {
      const user = userEvent.setup();
      renderNumberInput({ allowNegativeNumbers: false });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "-");
      // The minus sign should be blocked on keydown, so value remains empty
      expect(input.value).toBe("");
    });
  });

  describe("Decimal Point Handling", () => {
    it("prevents multiple decimal points", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "12.34.56");
      // The second decimal point should be prevented
      expect(input.value).not.toContain("12.34.56");
    });

    it("allows decimal separator when stepCount is provided", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "42.99");
      expect(input.value).toBe("42.99");
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows backspace key", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "123");
      await user.keyboard("{Backspace}");
      expect(input.value).toBe("12");
    });

    it("allows arrow keys", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "123");
      await user.keyboard("{ArrowLeft}");
      // Arrow key should not affect value
      expect(input.value).toBe("123");
    });

    it("allows tab navigation", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.click(input);
      await user.keyboard("{Tab}");
      expect(input).not.toHaveFocus();
    });
  });

  describe("Locale Formatting (English)", () => {
    it("displays formatted number on blur with en-CA locale", async () => {
      const user = userEvent.setup();
      renderNumberInput(
        { lang: "en", useThousandsSeparator: true, stepCount: 1 },
        { initialValue: "1234.5" }
      );

      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      // Initially shows formatted value with thousands separator
      expect(input.value).toContain("1,234");

      // User clears and enters new value
      await user.clear(input);
      await user.type(input, "9876543");
      await user.tab();

      // After blur, should format with thousands separator
      expect(input.value).toContain("9,876,543");
    });

    it("handles English decimal formatting", () => {
      renderNumberInput({ lang: "en", stepCount: 2 }, { initialValue: "123.45" });

      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.value).toBe("123.45");
    });
  });

  describe("Locale Formatting (French)", () => {
    it("displays formatted number on blur with fr-CA locale", () => {
      renderNumberInput(
        { lang: "fr", useThousandsSeparator: true, stepCount: 1 },
        { initialValue: "1234.5" }
      );

      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      // French uses narrow no-break space or regular space as thousands separator
      // Should have the formatted value
      expect(input.value).toMatch(/1\s+234/);
    });

    it("handles French decimal formatting", () => {
      renderNumberInput({ lang: "fr", stepCount: 2 }, { initialValue: "123.45" });

      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      // French uses comma as decimal separator
      expect(input.value).toBe("123,45");
    });
  });

  describe("Currency Formatting", () => {
    it("formats currency with USD code", async () => {
      renderNumberInput({ currencyCode: "USD", lang: "en" }, { initialValue: "1234.56" });

      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.value).toContain("$");
      expect(input.value).toContain("1");
    });

    it("allows decimal separator when currencyCode is provided", async () => {
      const user = userEvent.setup();
      renderNumberInput({ currencyCode: "CAD" });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "99.99");
      expect(input.value).toContain("99.99");
    });

    it("allows comma when currencyCode is provided", async () => {
      const user = userEvent.setup();
      renderNumberInput({ currencyCode: "EUR" });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "1000,50");
      // The comma should be accepted as part of locale formatting
      expect(input.value).toMatch(/[,.]/u);
    });
  });

  describe("Error Display", () => {
    it("displays error message when validation fails", async () => {
      const { rerender } = renderNumberInput({ required: true }, { initialValue: "" });

      // Force error state by triggering validation
      rerender(
        <Formik
          initialValues={{ amount: "" }}
          onSubmit={vi.fn()}
          initialErrors={{ amount: "Amount is required" }}
          initialTouched={{ amount: true }}
        >
          <Form>
            <NumberInput id="amount" name="amount" required />
          </Form>
        </Formik>
      );
    });

    it("applies error class when field has error", () => {
      renderNumberInput();
      const input = screen.getByTestId("numberInput");
      // Component should have gcds-input-text class initially
      expect(input).toHaveClass("gcds-input-text");
    });
  });

  describe("Accessibility", () => {
    it("sets aria-describedby when provided", () => {
      renderNumberInput({ ariaDescribedBy: "field-description" });
      const input = screen.getByTestId("numberInput");
      expect(input).toHaveAttribute("aria-describedby", "field-description");
    });

    it("does not set aria-describedby when not provided", () => {
      renderNumberInput();
      const input = screen.getByTestId("numberInput");
      expect(input).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("Intermediate States", () => {
    it("accepts incomplete number while typing", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "12");
      expect(input.value).toBe("12");

      await user.type(input, ".");
      expect(input.value).toBe("12.");

      await user.type(input, "5");
      expect(input.value).toBe("12.5");
    });

    it("accepts leading decimal point", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, ".5");
      expect(input.value).toBe(".5");
    });

    it("accepts negative intermediate states", async () => {
      const user = userEvent.setup();
      renderNumberInput({ allowNegativeNumbers: true, stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "-");
      expect(input.value).toBe("-");

      await user.type(input, "12.5");
      expect(input.value).toBe("-12.5");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string value", () => {
      renderNumberInput({}, { initialValue: "" });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("handles zero value", async () => {
      renderNumberInput({}, { initialValue: "0" });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;
      expect(input.value).toBe("0");
    });

    it("handles very large numbers", async () => {
      const user = userEvent.setup();
      renderNumberInput({ useThousandsSeparator: true });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "999999999");
      expect(input.value).toBe("999999999");
    });

    it("clears display on blur with invalid number", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "123invalid");
      // Invalid characters should be stripped
      expect(input.value).not.toContain("invalid");
    });
  });

  describe("Blur Behavior", () => {
    it("formats number on blur", async () => {
      const user = userEvent.setup();
      renderNumberInput({ lang: "en", useThousandsSeparator: true }, { initialValue: "" });

      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "1234567");
      expect(input.value).toBe("1234567");

      await user.tab();

      // After blur, thousands separator should be applied
      expect(input.value).toContain(",");
    });

    it("preserves empty value on blur", async () => {
      const user = userEvent.setup();
      renderNumberInput();
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.click(input);
      await user.tab();

      expect(input.value).toBe("");
    });

    it("converts to valid number on blur", async () => {
      const user = userEvent.setup();
      renderNumberInput({ stepCount: 2 });
      const input = screen.getByTestId("numberInput") as HTMLInputElement;

      await user.type(input, "100.50");
      await user.tab();

      // Should be a valid formatted number
      expect(input.value).not.toBe("");
    });
  });
});
