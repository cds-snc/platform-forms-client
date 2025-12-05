import { describe, it, expect, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { ElementDialog } from "@formBuilder/[id]/edit/components/elements/element-dialog/ElementDialog";
import { render } from "./testUtils";
import { setupFonts } from "../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<ElementDialog />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("adds a richText element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the richText element
    const richTextElement = page.getByTestId("richText");
    await richTextElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Page text");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("richText");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a textField element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the textField element
    const textFieldElement = page.getByTestId("textField");
    await textFieldElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Short answer");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("textField");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a textArea element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the textArea element
    const textAreaElement = page.getByTestId("textArea");
    await textAreaElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Long answer");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("textArea");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a radio element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the radio element
    const radioElement = page.getByTestId("radio");
    await radioElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Radio buttons");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("radio");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a checkbox element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the checkbox element
    const checkboxElement = page.getByTestId("checkbox");
    await checkboxElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Checkboxes");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("checkbox");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a dropdown element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the dropdown element
    const dropdownElement = page.getByTestId("dropdown");
    await dropdownElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Dropdown");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("dropdown");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });
});
