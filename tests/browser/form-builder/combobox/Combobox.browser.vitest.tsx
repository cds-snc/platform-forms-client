import { describe, it, expect, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { Combobox } from "@clientComponents/forms/Combobox/Combobox";
import { Formik } from "formik";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<Combobox />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("mounts", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const combobox = page.getByTestId("combobox");
    await expect.element(combobox).toBeVisible();

    const input = page.getByTestId("combobox-input");
    await expect.element(input).toBeVisible();

    const listbox = page.getByTestId("combobox-listbox");
    await expect.element(listbox).toBeInTheDocument();
    await expect.element(listbox).not.toBeVisible();
  });

  it("filters list based on input", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const input = page.getByTestId("combobox-input");
    await input.click();

    const listbox = page.getByTestId("combobox-listbox");
    await expect.element(listbox).toBeVisible();

    await input.fill("o");
    let items = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    expect(items.length).toBe(3);

    await input.fill("on");
    items = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    expect(items.length).toBe(1);
  });

  it("keyboard navigates the list", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const input = page.getByTestId("combobox-input");
    await input.click(); // Open the listbox first
    await userEvent.keyboard("{ArrowDown}");

    let listItems = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    let selectedItem = Array.from(listItems).find((li) => li.textContent === "one");
    expect(selectedItem?.getAttribute("aria-selected")).toBe("true");

    await userEvent.keyboard("{ArrowDown}");
    listItems = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    selectedItem = Array.from(listItems).find((li) => li.textContent === "two");
    expect(selectedItem?.getAttribute("aria-selected")).toBe("true");

    await userEvent.keyboard("{ArrowDown}");
    listItems = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    selectedItem = Array.from(listItems).find((li) => li.textContent === "three");
    expect(selectedItem?.getAttribute("aria-selected")).toBe("true");

    await userEvent.keyboard("{ArrowDown}");
    listItems = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    selectedItem = Array.from(listItems).find((li) => li.textContent === "four");
    expect(selectedItem?.getAttribute("aria-selected")).toBe("true");

    await userEvent.keyboard("{ArrowDown}");
    listItems = document.querySelectorAll("[data-testid=combobox-listbox] > li");
    selectedItem = Array.from(listItems).find((li) => li.textContent === "five");
    expect(selectedItem?.getAttribute("aria-selected")).toBe("true");
  });

  it("sets visibility of list based on focus", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const listbox = page.getByTestId("combobox-listbox");
    await expect.element(listbox).not.toBeVisible();

    const input = page.getByTestId("combobox-input");
    await input.click();

    await expect.element(listbox).toBeVisible();
    await expect.element(input).toHaveAttribute("aria-expanded", "true");

    await input.element().blur();
    await expect.element(listbox).not.toBeVisible();
  });

  it("selects items from the list", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const input = page.getByTestId("combobox-input");
    await input.click(); // Open the listbox first
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    const inputValue = await input.element().getAttribute("value");
    expect(inputValue).toBe("two");

    const listbox = page.getByTestId("combobox-listbox");
    await expect.element(listbox).not.toBeVisible();

    await userEvent.keyboard("{Backspace}{Backspace}{Backspace}");
    const clearedValue = await input.element().getAttribute("value");
    expect(clearedValue).toBe("");

    await input.click(); // Reopen the listbox - starts at "one"
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}"); // one -> two -> three -> four
    const newValue = await input.element().getAttribute("value");
    expect(newValue).toBe("four");

    await userEvent.keyboard("{Escape}");
    const finalValue = await input.element().getAttribute("value");
    expect(finalValue).toBe("");
  });

  it("clears input by pressing escape", async () => {
    await render(
      <Formik
        initialValues={{ combobox: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <Combobox name="combobox" choices={["one", "two", "three", "four", "five"]} />
      </Formik>
    );

    const input = page.getByTestId("combobox-input");
    await input.fill("two");
    await userEvent.keyboard("{Enter}");

    let inputValue = await input.element().getAttribute("value");
    expect(inputValue).toBe("two");

    await userEvent.keyboard("{Escape}");
    inputValue = await input.element().getAttribute("value");
    expect(inputValue).toBe("");
  });
});
