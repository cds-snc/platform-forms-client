import { describe, it, expect, vi, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { PanelActions } from "@formBuilder/[id]/edit/components/PanelActions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<PanelActions />", () => {
  beforeAll(() => {
    setupFonts();
  });

  const item = {
    id: 1,
    type: FormElementTypes.textField,
    properties: {
      subElements: [],
      choices: [
        {
          en: "",
          fr: "",
        },
      ],
      titleEn: "Short answer",
      titleFr: "",
      validation: {
        required: false,
      },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    },
    index: 0,
    questionNumber: 0,
  };

  it("enables move buttons for item that is not first or last", async () => {
    const handleAddSpy = vi.fn();
    const handleRemoveSpy = vi.fn();
    const handleMoveUpSpy = vi.fn();
    const handleMoveDownSpy = vi.fn();
    const handleDuplicateSpy = vi.fn();

    await render(
      <div className="relative">
        <PanelActions
          item={item}
          isFirstItem={false}
          isLastItem={false}
          totalItems={0}
          handleAdd={handleAddSpy}
          handleRemove={handleRemoveSpy}
          handleMoveUp={handleMoveUpSpy}
          handleMoveDown={handleMoveDownSpy}
          handleDuplicate={handleDuplicateSpy}
        />
      </div>
    );

    const moveUpButton = page.getByTestId("moveUp");
    const moveDownButton = page.getByTestId("moveDown");

    await expect.element(moveUpButton).toBeEnabled();
    await expect.element(moveDownButton).toBeEnabled();
  });

  it("disables move buttons for first and last item", async () => {
    const handleAddSpy = vi.fn();
    const handleRemoveSpy = vi.fn();
    const handleMoveUpSpy = vi.fn();
    const handleMoveDownSpy = vi.fn();
    const handleDuplicateSpy = vi.fn();

    await render(
      <div className="group relative">
        <PanelActions
          item={item}
          isFirstItem={true}
          isLastItem={true}
          totalItems={0}
          handleAdd={handleAddSpy}
          handleRemove={handleRemoveSpy}
          handleMoveUp={handleMoveUpSpy}
          handleMoveDown={handleMoveDownSpy}
          handleDuplicate={handleDuplicateSpy}
        />
      </div>
    );

    const moveUpButton = page.getByTestId("moveUp");
    const moveDownButton = page.getByTestId("moveDown");
    const duplicateButton = page.getByTestId("duplicate");
    const removeButton = page.getByTestId("remove");
    const moreButton = page.getByTestId("more");

    // Check disabled state
    await expect.element(moveUpButton).toBeDisabled();
    await expect.element(moveUpButton).toHaveAttribute("tabindex", "-1");
    await expect.element(moveDownButton).toBeDisabled();
    await expect.element(moveDownButton).toHaveAttribute("tabindex", "-1");

    // Check enabled buttons
    await expect.element(duplicateButton).toBeEnabled();
    await expect.element(duplicateButton).toHaveAttribute("tabindex", "0");
    await expect.element(removeButton).toBeEnabled();
    await expect.element(removeButton).toHaveAttribute("tabindex", "-1");
    await expect.element(moreButton).toBeEnabled();
    await expect.element(moreButton).toHaveAttribute("tabindex", "-1");

    // Keyboard navigation should start at duplicate
    await userEvent.keyboard("{Tab}");
    let focusedElement = page.getByTestId("duplicate");
    await expect.element(focusedElement).toHaveFocus();

    // Left arrow should stay on duplicate (first enabled button)
    await userEvent.keyboard("{ArrowLeft}");
    focusedElement = page.getByTestId("duplicate");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow should move to remove
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("remove");
    await expect.element(focusedElement).toHaveFocus();
  });

  it("can keyboard navigate", async () => {
    const handleAddSpy = vi.fn();
    const handleRemoveSpy = vi.fn();
    const handleMoveUpSpy = vi.fn();
    const handleMoveDownSpy = vi.fn();
    const handleDuplicateSpy = vi.fn();

    await render(
      <div className="group relative">
        <PanelActions
          item={item}
          isFirstItem={false}
          isLastItem={false}
          totalItems={0}
          handleAdd={handleAddSpy}
          handleRemove={handleRemoveSpy}
          handleMoveUp={handleMoveUpSpy}
          handleMoveDown={handleMoveDownSpy}
          handleDuplicate={handleDuplicateSpy}
        />
      </div>
    );

    // Tab to first button (moveUp)
    await userEvent.keyboard("{Tab}");
    let focusedElement = page.getByTestId("moveUp");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow to moveDown
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("moveDown");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow to duplicate
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("duplicate");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow to remove
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("remove");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow to more
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("more");
    await expect.element(focusedElement).toHaveFocus();

    // Right arrow should stay on more (last button)
    await userEvent.keyboard("{ArrowRight}");
    focusedElement = page.getByTestId("more");
    await expect.element(focusedElement).toHaveFocus();

    // Left arrow to remove
    await userEvent.keyboard("{ArrowLeft}");
    focusedElement = page.getByTestId("remove");
    await expect.element(focusedElement).toHaveFocus();

    // Left arrow to duplicate
    await userEvent.keyboard("{ArrowLeft}");
    focusedElement = page.getByTestId("duplicate");
    await expect.element(focusedElement).toHaveFocus();

    // Left arrow to moveDown
    await userEvent.keyboard("{ArrowLeft}");
    focusedElement = page.getByTestId("moveDown");
    await expect.element(focusedElement).toHaveFocus();

    // Left arrow to moveUp
    await userEvent.keyboard("{ArrowLeft}");
    focusedElement = page.getByTestId("moveUp");
    await expect.element(focusedElement).toHaveFocus();

    // Tab to next element (add-element button)
    await userEvent.keyboard("{Tab}");
    focusedElement = page.getByTestId("add-element");
    await expect.element(focusedElement).toHaveFocus();

    // Shift+Tab back to moveUp
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    focusedElement = page.getByTestId("moveUp");
    await expect.element(focusedElement).toHaveFocus();
  });
});
