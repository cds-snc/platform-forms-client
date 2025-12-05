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

  it("adds a date element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the formattedDate element
    const formattedDateElement = page.getByTestId("formattedDate");
    await formattedDateElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Date");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("formattedDate");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a number element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the preset filter first to reveal the number element
    const presetFilter = page.getByTestId("preset-filter");
    await presetFilter.click();

    // Click on the number element
    const numberElement = page.getByTestId("number");
    await numberElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Number");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("number");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a attestation element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the attestation element
    const attestationElement = page.getByTestId("attestation");
    await attestationElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Attestation");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("attestation");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a full name element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the name element
    const nameElement = page.getByTestId("name");
    await nameElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Full name");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("name");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a individual names element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the firstMiddleLastName element
    const firstMiddleLastNameElement = page.getByTestId("firstMiddleLastName");
    await firstMiddleLastNameElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Individual names");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("firstMiddleLastName");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds an address element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the address element
    const addressElement = page.getByTestId("address");
    await addressElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Address");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("address");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a contact element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the contact element
    const contactElement = page.getByTestId("contact");
    await contactElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Contact");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("contact");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it.skip("adds a fileInput element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the fileInput element
    const fileInputElement = page.getByTestId("fileInput");
    await fileInputElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("File upload");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("fileInput");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("adds a dynamicRow contact element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the dynamicRow element
    const dynamicRowElement = page.getByTestId("dynamicRow");
    await dynamicRowElement.click();

    // Verify the description content is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("Repeating set");

    const descriptionText = page.getByTestId("element-description-text");
    await expect.element(descriptionText).toBeVisible();

    // Press Enter to confirm
    await userEvent.keyboard("{Enter}");

    // Verify the handlers were called correctly
    expect(handleAddTypeSpy).toHaveBeenCalledWith("dynamicRow");
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it("closes the dialog", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the close dialog button
    const closeButton = page.getByTestId("close-dialog");
    await closeButton.click();

    // Verify the close handler was called
    expect(handleCloseSpy).toHaveBeenCalledOnce();
  });

  it.skip("can keyboard navigate through the listbox", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the all-filter to show all elements
    const allFilter = page.getByTestId("all-filter");
    await allFilter.click();

    // Verify textField is selected first by default
    const textField = page.getByTestId("textField");
    await expect.element(textField).toHaveAttribute("aria-selected", "true");

    // Navigate down through the list
    await userEvent.keyboard("{ArrowDown}");
    const textArea = page.getByTestId("textArea");
    await expect.element(textArea).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const radio = page.getByTestId("radio");
    await expect.element(radio).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const checkbox = page.getByTestId("checkbox");
    await expect.element(checkbox).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const dropdown = page.getByTestId("dropdown");
    await expect.element(dropdown).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const combobox = page.getByTestId("combobox");
    await expect.element(combobox).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const attestation = page.getByTestId("attestation");
    await expect.element(attestation).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const name = page.getByTestId("name");
    await expect.element(name).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const firstMiddleLastName = page.getByTestId("firstMiddleLastName");
    await expect.element(firstMiddleLastName).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const formattedDate = page.getByTestId("formattedDate");
    await expect.element(formattedDate).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const contact = page.getByTestId("contact");
    await expect.element(contact).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const address = page.getByTestId("address");
    await expect.element(address).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const departments = page.getByTestId("departments");
    await expect.element(departments).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const number = page.getByTestId("number");
    await expect.element(number).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const richText = page.getByTestId("richText");
    await expect.element(richText).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const fileInput = page.getByTestId("fileInput");
    await expect.element(fileInput).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const dynamicRow = page.getByTestId("dynamicRow");
    await expect.element(dynamicRow).toHaveAttribute("aria-selected", "true");
  });
});
