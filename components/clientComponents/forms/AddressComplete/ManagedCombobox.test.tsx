/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      <>
        <label id="label-province" htmlFor="province">
          Province
        </label>
        <ManagedCombobox
          id="province"
          name="province"
          choices={["Ontario", "Quebec"]}
          required
          ariaDescribedBy="province-help"
        />
      </>
    </Formik>
  );

describe("ManagedCombobox", () => {
  afterEach(() => cleanup());

  it.each([
    ["Etats", "États-Unis"],
    ["ÉTATS", "États-Unis"],
    ["Tai", "Taïwan"],
  ])("finds %s and preserves the selected label %s", async (query, expected) => {
    const user = userEvent.setup();
    render(
      <Formik initialValues={{ country: "" }} onSubmit={() => {}}>
        <>
          <label htmlFor="country">Country</label>
          <ManagedCombobox
            id="country"
            name="country"
            choices={["Canada", "États-Unis", "Taïwan"]}
          />
        </>
      </Formik>
    );

    const input = screen.getByRole("combobox", { name: "Country" });
    await user.type(input, query);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent(expected);

    await user.click(options[0]);
    expect(input).toHaveValue(expected);
  });

  it("exposes required state without native required validation", () => {
    renderManagedCombobox();

    const input = screen.getByTestId("combobox-input");

    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAttribute("aria-describedby", "province-help");
    expect(screen.getByTestId("combobox-listbox")).toHaveAttribute(
      "aria-labelledby",
      "label-province"
    );
    expect(document.getElementById("label-province")).toBe(screen.getByText("Province"));
  });

  it("associates validation errors with the input", () => {
    renderManagedCombobox({ error: "Choose a province" });

    const input = screen.getByTestId("combobox-input");
    const error = screen.getByTestId("errorMessage");

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "errorMessage-province province-help");
    expect(error).toHaveAttribute("id", "errorMessage-province");
    expect(error).toHaveTextContent("Choose a province");
  });
});
