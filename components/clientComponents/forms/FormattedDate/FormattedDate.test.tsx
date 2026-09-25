/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Form, Formik } from "formik";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormattedDate } from "./FormattedDate";

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@clientComponents/forms", () => ({
  ErrorMessage: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <p id={id} role="alert">
      {children}
    </p>
  ),
}));

const renderFormattedDate = (
  props: Partial<React.ComponentProps<typeof FormattedDate>> = {},
  initialErrors: Record<string, string> = {}
) =>
  render(
    <Formik initialValues={{ date: "" }} initialErrors={initialErrors} onSubmit={vi.fn()}>
      <Form>
        <FormattedDate id="date" name="date" label="Date" {...props} />
      </Form>
    </Formik>
  );

describe("FormattedDate accessibility", () => {
  afterEach(() => cleanup());

  it("uses ARIA required state without native required attributes", () => {
    renderFormattedDate({ required: true, description: "Date help" });

    const controls = [
      screen.getByTestId("year-number"),
      screen.getByTestId("month-number"),
      screen.getByTestId("day-number"),
    ];

    controls.forEach((control) => {
      expect(control).not.toHaveAttribute("required");
      expect(control).toHaveAttribute("aria-required", "true");
      expect(control).not.toHaveAttribute("aria-invalid");
    });

    expect(screen.getByTestId("formattedDate")).toHaveAttribute("aria-describedby", "desc-date");
    expect(screen.getByTestId("description")).toHaveAttribute("id", "desc-date");
    expect(screen.getByTestId("required")).toBeInTheDocument();
  });

  it("supports optional select and date controls", () => {
    renderFormattedDate({ monthSelector: "select" });

    const controls = [
      screen.getByTestId("year-number"),
      screen.getByTestId("month-select"),
      screen.getByTestId("day-number"),
    ];

    controls.forEach((control) => {
      expect(control).not.toHaveAttribute("required");
      expect(control).not.toHaveAttribute("aria-required");
      expect(control).not.toHaveAttribute("aria-invalid");
    });
  });

  it("associates validation errors with the fieldset and date controls", () => {
    renderFormattedDate(
      { required: true, description: "Date help" },
      { date: "Enter a valid date" }
    );

    expect(screen.getByTestId("formattedDate")).toHaveAttribute(
      "aria-describedby",
      "errorMessage-date desc-date"
    );

    expect(screen.getByTestId("year-number")).toHaveAttribute(
      "aria-describedby",
      "errorMessage-date date-description-year"
    );
    expect(screen.getByTestId("month-number")).toHaveAttribute(
      "aria-describedby",
      "errorMessage-date date-description-month"
    );
    expect(screen.getByTestId("day-number")).toHaveAttribute(
      "aria-describedby",
      "errorMessage-date date-description-day"
    );

    ["year-number", "month-number", "day-number"].forEach((testId) => {
      expect(screen.getByTestId(testId)).toHaveAttribute("aria-invalid", "true");
    });

    const error = screen.getByRole("alert");
    expect(error).toHaveAttribute("id", "errorMessage-date");
    expect(error).toHaveTextContent("Enter a valid date");
  });
});
