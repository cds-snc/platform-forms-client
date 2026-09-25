/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import { afterEach, describe, expect, it } from "vitest";
import { ManagedCombobox } from "./ManagedCombobox";

const renderManagedCombobox = ({ error }: { error?: string } = {}) =>
  render(
    <Formik
      initialValues={{ province: "" }}
      initialErrors={error ? { province: error } : undefined}
      onSubmit={() => {}}
    >
      <ManagedCombobox
        id="province"
        name="province"
        choices={["Ontario", "Quebec"]}
        required
        ariaDescribedBy="province-help"
      />
    </Formik>
  );

describe("ManagedCombobox", () => {
  afterEach(() => cleanup());

  it("exposes required state without native required validation", () => {
    renderManagedCombobox();

    const input = screen.getByTestId("combobox-input");

    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAttribute("aria-describedby", "province-help");
  });

  it("associates validation errors with the input", () => {
    renderManagedCombobox({ error: "Choose a province" });

    const input = screen.getByTestId("combobox-input");
    const error = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "errorMessage-province province-help");
    expect(error).toHaveAttribute("id", "errorMessage-province");
    expect(error).toHaveTextContent("Choose a province");
  });
});
