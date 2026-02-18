import { describe, it, expect, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { ElementDialog } from "@formBuilder/[id]/edit/components/elements/element-dialog/ElementDialog";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

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

  it("adds a fileInput element", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the fileInput element
    const fileInputElement = page.getByTestId("fileInput");
    await fileInputElement.click();

    // Verify the description title is visible on the right side
    const descriptionTitle = page.getByTestId("element-description-title");
    await expect.element(descriptionTitle).toBeVisible();
    await expect.element(descriptionTitle).toHaveTextContent("File upload");

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

  it("can keyboard navigate through the listbox", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Click on the all-filter to show all elements
    const allFilter = page.getByTestId("all-filter");
    await allFilter.click();

    // check focus is on the all-filter
    await expect.element(allFilter).toHaveFocus();

    await userEvent.tab();
    // check focus is on the listbox
    const listbox = page.getByRole("listbox");
    await expect.element(listbox).toHaveFocus();

    // Verify textField is selected first by default
    const textField = listbox.getByTestId("textField");
    await expect.element(textField).toHaveAttribute("aria-selected", "true");

    // Navigate down through the list
    await userEvent.keyboard("{ArrowDown}");
    const textArea = listbox.getByTestId("textArea");
    await expect.element(textArea).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const radio = listbox.getByTestId("radio");
    await expect.element(radio).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const checkbox = listbox.getByTestId("checkbox");
    await expect.element(checkbox).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const dropdown = listbox.getByTestId("dropdown");
    await expect.element(dropdown).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const combobox = listbox.getByTestId("combobox");
    await expect.element(combobox).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const attestation = listbox.getByTestId("attestation");
    await expect.element(attestation).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const name = listbox.getByTestId("name");
    await expect.element(name).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const firstMiddleLastName = listbox.getByTestId("firstMiddleLastName");
    await expect.element(firstMiddleLastName).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const formattedDate = listbox.getByTestId("formattedDate");
    await expect.element(formattedDate).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const contact = listbox.getByTestId("contact");
    await expect.element(contact).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const address = listbox.getByTestId("address");
    await expect.element(address).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const departments = listbox.getByTestId("departments");
    await expect.element(departments).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const number = listbox.getByTestId("number");
    await expect.element(number).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const richText = listbox.getByTestId("richText");
    await expect.element(richText).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const fileInput = listbox.getByTestId("fileInput");
    await expect.element(fileInput).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    const dynamicRow = listbox.getByTestId("dynamicRow");
    await expect.element(dynamicRow).toHaveAttribute("aria-selected", "true");
  });

  it("Keyboard navigate the filters", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Verify all-filter has focus by default
    const allFilter = page.getByTestId("all-filter");
    await expect.element(allFilter).toHaveFocus();

    // Navigate right to basic filter
    await userEvent.keyboard("{ArrowRight}");
    const basicFilter = page.getByTestId("basic-filter");
    await expect.element(basicFilter).toHaveFocus();

    // Navigate right to preset filter
    await userEvent.keyboard("{ArrowRight}");
    const presetFilter = page.getByTestId("preset-filter");
    await expect.element(presetFilter).toHaveFocus();

    // Navigate right to other filter
    await userEvent.keyboard("{ArrowRight}");
    const otherFilter = page.getByTestId("other-filter");
    await expect.element(otherFilter).toHaveFocus();

    // Navigate left back to preset filter
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(presetFilter).toHaveFocus();

    // Navigate left back to basic filter
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(basicFilter).toHaveFocus();

    // Navigate left back to all filter
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(allFilter).toHaveFocus();
  });

  it("Can filter the listbox", async () => {
    const handleCloseSpy = vi.fn();
    const handleAddTypeSpy = vi.fn();

    await render(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // All filter should show 17 elements
    const allFilter = page.getByTestId("all-filter");
    await allFilter.click();
    let options = await page.getByRole("option").all();
    expect(options.length).toBe(17);

    // Basic filter should show 7 elements
    const basicFilter = page.getByTestId("basic-filter");
    await basicFilter.click();
    options = await page.getByRole("option").all();
    expect(options.length).toBe(7);

    // Preset filter should show 7 elements
    const presetFilter = page.getByTestId("preset-filter");
    await presetFilter.click();
    options = await page.getByRole("option").all();
    expect(options.length).toBe(7);

    // Other filter should show 3 elements
    const otherFilter = page.getByTestId("other-filter");
    await otherFilter.click();
    options = await page.getByRole("option").all();
    expect(options.length).toBe(3);

    // Go back to all filter
    await allFilter.click();
    options = await page.getByRole("option").all();
    expect(options.length).toBe(17);
  });
});
