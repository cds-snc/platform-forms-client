import { FeatureImplementation, HotkeyConfig, TreeInstance } from "@headless-tree/core";

/**
 * Utility to create hotkey configurations that fix the drag state isEnabled conditions.
 * This preserves all original functionality while only overriding the problematic isEnabled checks.
 */
const createFixedHotkey = <T>(
  baseConfig: Partial<HotkeyConfig<T>>,
  fixedIsEnabled: (tree: TreeInstance<T>) => boolean
): HotkeyConfig<T> => ({
  ...baseConfig,
  isEnabled: fixedIsEnabled,
} as HotkeyConfig<T>);

/**
 * Feature to fix drag state issues after mouse drag operations.
 * 
 * Problem: After mouse drag/drop, the dnd state object remains with undefined properties.
 * The default isEnabled conditions check !tree.getState().dnd, which returns false
 * because the object exists, preventing hotkeys from working.
 * 
 * Solution: Override isEnabled conditions to check for actual drag activity.
 */
export const dragStateFixFeature: FeatureImplementation = {
  key: "drag-state-fix",
  deps: ["hotkeys-core", "keyboard-drag-and-drop", "selection"],
  
  hotkeys: {
    // Fix ArrowDown navigation - preserve original handler but fix isEnabled
    focusNextItem: createFixedHotkey(
      {
        hotkey: "ArrowDown",
        handler: (_, tree) => {
          tree.focusNextItem();
          tree.updateDomFocus();
          // Select the focused item to enable keyboard drag (CTRL-SHIFT-D)
          const focusedItem = tree.getFocusedItem();
          tree.setSelectedItems([focusedItem.getId()]);
        },
      },
      (tree) => !tree.getState().dnd?.draggedItems
    ),
    
    // Fix ArrowUp navigation - preserve original handler but fix isEnabled
    focusPreviousItem: createFixedHotkey(
      {
        hotkey: "ArrowUp", 
        handler: (_, tree) => {
          tree.focusPreviousItem();
          tree.updateDomFocus();
          // Select the focused item to enable keyboard drag (CTRL-SHIFT-D)
          const focusedItem = tree.getFocusedItem();
          tree.setSelectedItems([focusedItem.getId()]);
        },
      },
      (tree) => !tree.getState().dnd?.draggedItems
    ),
    
    // Fix CTRL-SHIFT-D - preserve original handler but fix isEnabled
    startDrag: createFixedHotkey(
      {
        hotkey: "Control+Shift+KeyD",
        preventDefault: true,
        handler: (_, tree) => {
          const selectedItems = tree.getSelectedItems?.() || [tree.getFocusedItem()];
          const focusedItem = tree.getFocusedItem();
          const itemsToMove = selectedItems.includes(focusedItem)
            ? selectedItems
            : selectedItems.concat(focusedItem);
          tree.startKeyboardDrag(itemsToMove);
        },
      },
      (tree) => !tree.getState().dnd?.draggedItems
    ),
  },
};