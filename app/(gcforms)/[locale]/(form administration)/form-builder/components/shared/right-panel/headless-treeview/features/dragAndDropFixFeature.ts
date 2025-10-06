import { FeatureImplementation } from "@headless-tree/core";

/**
 * Utility to create hotkey configurations that fix the drag state isEnabled conditions.
 * This preserves all original functionality while only overriding the problematic isEnabled checks
 * and ensuring the focused item becomes selected when navigating with arrow keys.
 *
 * This is a workaround for issues in the headless-tree library where certain drag-and-drop
 * operations can leave the tree in an inconsistent state, particularly when using keyboard navigation.
 */
export const dragAndDropFixFeature: FeatureImplementation = {
  key: "drag-drop-fix",
  deps: ["hotkeys-core", "keyboard-drag-and-drop", "selection"],

  hotkeys: {
    focusNextItem: {
      hotkey: "ArrowDown",
      canRepeat: true,
      preventDefault: true,
      isEnabled: (tree) => !(tree.isSearchOpen?.() ?? false) && !tree.getState().dnd?.draggedItems, // TODO what happens when the feature doesnt exist? proxy method still claims to exist
      handler: (e, tree) => {
        tree.focusNextItem();
        tree.updateDomFocus();

        // Select the focused item to enable keyboard drag (CTRL-SHIFT-D)
        const focusedItem = tree.getFocusedItem();
        tree.setSelectedItems([focusedItem.getId()]);
      },
    },
    focusPreviousItem: {
      hotkey: "ArrowUp",
      canRepeat: true,
      preventDefault: true,
      isEnabled: (tree) => !(tree.isSearchOpen?.() ?? false) && !tree.getState().dnd?.draggedItems,
      handler: (e, tree) => {
        tree.focusPreviousItem();
        tree.updateDomFocus();

        // Select the focused item to enable keyboard drag (CTRL-SHIFT-D)
        const focusedItem = tree.getFocusedItem();
        tree.setSelectedItems([focusedItem.getId()]);
      },
    },
    startDrag: {
      hotkey: "Control+Shift+KeyD",
      preventDefault: true,
      isEnabled: (tree) => !tree.getState().dnd?.draggedItems,
      handler: (_, tree) => {
        const selectedItems = tree.getSelectedItems?.() ?? [tree.getFocusedItem()];
        const focusedItem = tree.getFocusedItem();

        tree.startKeyboardDrag(
          selectedItems.includes(focusedItem) ? selectedItems : selectedItems.concat(focusedItem)
        );
      },
    },
  },
};
