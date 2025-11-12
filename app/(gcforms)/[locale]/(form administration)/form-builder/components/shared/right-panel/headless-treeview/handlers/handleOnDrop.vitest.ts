import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { handleOnDrop } from './handleOnDrop';
import { DragTarget, ItemInstance, insertItemsAtTarget, removeItemsFromParents, isOrderedDragTarget } from '@headless-tree/core';
import { TreeItemData } from '../types';
import { FormElement } from '@root/lib/types';

// Mock the headless-tree functions
vi.mock('@headless-tree/core', async () => {
  const actual = await vi.importActual('@headless-tree/core');
  return {
    ...actual,
    insertItemsAtTarget: vi.fn(),
    removeItemsFromParents: vi.fn(),
    isOrderedDragTarget: vi.fn(),
  };
});

const mockInsertItemsAtTarget = vi.mocked(insertItemsAtTarget);
const mockRemoveItemsFromParents = vi.mocked(removeItemsFromParents);
const mockIsOrderedDragTarget = vi.mocked(isOrderedDragTarget);

// Helper to create mock ItemInstance
const createMockItem = (
  id: string,
  level: number,
  data: Partial<TreeItemData> = {}
): ItemInstance<TreeItemData> => ({
  getId: () => id,
  getItemMeta: () => ({ level }),
  getItemData: () => ({ type: data.type, ...data }),
  setFocused: vi.fn(),
} as unknown as ItemInstance<TreeItemData>);

// Helper to create mock DragTarget
const createMockTarget = (
  targetItem: ItemInstance<TreeItemData>,
  insertionIndex?: number
): DragTarget<TreeItemData> => ({
  item: targetItem,
  ...(insertionIndex !== undefined && { insertionIndex }),
} as DragTarget<TreeItemData>);

// Helper to create mock FormElement
const createMockFormElement = (id: number, type: string = 'textField'): FormElement => ({
  id,
  type,
  properties: {},
} as FormElement);

describe('handleOnDrop', () => {
  // Mock callback functions
  let mockGetSubElements: Mock<(parentId: number) => FormElement[] | undefined>;
  let mockSetGroupsLayout: Mock<(layout: string[]) => void>;
  let mockUpdateGroupElements: Mock<(group: { id: string; elements: string[] }) => void>;
  let mockUpdateSubElements: Mock<(elements: FormElement[], parentId: number) => void>;
  let mockAutoFlowAll: Mock<() => void>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock functions
  mockGetSubElements = vi.fn() as Mock<(parentId: number) => FormElement[] | undefined>;
  mockSetGroupsLayout = vi.fn() as Mock<(layout: string[]) => void>;
  mockUpdateGroupElements = vi.fn() as Mock<(group: { id: string; elements: string[] }) => void>;
  mockUpdateSubElements = vi.fn() as Mock<(elements: FormElement[], parentId: number) => void>;
  mockAutoFlowAll = vi.fn() as Mock<() => void>;

    // Setup default mock implementations
    mockRemoveItemsFromParents.mockImplementation(async (items, callback) => {
      // Simulate calling the callback for each item's parent
      const promises = items.map((item) => callback(item as ItemInstance<unknown>, ['newChild1', 'newChild2']));
      await Promise.all(promises);
    });

    mockInsertItemsAtTarget.mockImplementation(async (itemIds, target, callback) => {
      // Simulate calling the callback with updated children
      await callback(target.item as ItemInstance<unknown>, ['item1', 'item2', ...itemIds]);
    });
  });

  describe('Root level drops (level -1)', () => {
    it('should block non-ordered drops on root level', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1));

      mockIsOrderedDragTarget.mockReturnValue(false);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should return early without calling any operations
      expect(mockRemoveItemsFromParents).not.toHaveBeenCalled();
      expect(mockInsertItemsAtTarget).not.toHaveBeenCalled();
    });

    it('should allow ordered drops on root level', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockRemoveItemsFromParents).toHaveBeenCalledWith(items, expect.any(Function));
      expect(mockInsertItemsAtTarget).toHaveBeenCalledWith(['group1'], target, expect.any(Function));
    });

    it('should call setGroupsLayout and autoFlowAll for root level drops', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockSetGroupsLayout).toHaveBeenCalledTimes(2); // Once for remove, once for insert
      expect(mockAutoFlowAll).toHaveBeenCalledTimes(1);
    });

    it('should focus the last moved item after root level drop', async () => {
      const item1 = createMockItem('group1', 0);
      const item2 = createMockItem('group2', 0);
      const items = [item1, item2];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(item2.setFocused).toHaveBeenCalled();
      expect(item1.setFocused).not.toHaveBeenCalled();
    });

    it('should filter out locked items (policy, intro) from root layout', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      // Mock the callbacks to include locked items
      mockRemoveItemsFromParents.mockImplementation(async (items, callback) => {
        await callback(items[0] as ItemInstance<unknown>, ['policy', 'intro', 'validGroup']);
      });

      mockInsertItemsAtTarget.mockImplementation(async (itemIds, target, callback) => {
        await callback(target.item as ItemInstance<unknown>, ['policy', 'intro', 'validGroup', ...itemIds]);
      });

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should be called with filtered arrays (no policy/intro)
      expect(mockSetGroupsLayout).toHaveBeenCalledWith(['validGroup']);
      expect(mockSetGroupsLayout).toHaveBeenLastCalledWith(['validGroup', 'group1']);
    });
  });

  describe('Group level drops (level 0)', () => {
    it('should call updateGroupElements for group level drops', async () => {
      const items = [createMockItem('element1', 1)];
      const targetGroup = createMockItem('group1', 0);
      const target = createMockTarget(targetGroup);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockUpdateGroupElements).toHaveBeenCalledTimes(2); // Once for remove, once for insert
      expect(mockUpdateGroupElements).toHaveBeenCalledWith({
        id: 'group1',
        elements: expect.any(Array)
      });
    });

    it('should filter out locked items from group elements', async () => {
      const items = [createMockItem('element1', 1)];
      const targetGroup = createMockItem('group1', 0);
      const target = createMockTarget(targetGroup);

      mockRemoveItemsFromParents.mockImplementation(async (items, callback) => {
        await callback(targetGroup as ItemInstance<unknown>, ['policy', 'intro', 'validElement']);
      });

      mockInsertItemsAtTarget.mockImplementation(async (itemIds, target, callback) => {
        await callback(target.item as ItemInstance<unknown>, ['policy', 'intro', 'validElement', ...itemIds]);
      });

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockUpdateGroupElements).toHaveBeenCalledWith({
        id: 'group1',
        elements: ['validElement']
      });
      expect(mockUpdateGroupElements).toHaveBeenLastCalledWith({
        id: 'group1',
        elements: ['validElement', 'element1']
      });
    });
  });

  describe('Sub-element level drops (level 1)', () => {
    const mockSubElements = [
      createMockFormElement(1, 'textField'),
      createMockFormElement(2, 'textArea'),
      createMockFormElement(3, 'checkbox'),
    ];

    beforeEach(() => {
      mockGetSubElements.mockReturnValue(mockSubElements);
    });

    it('should handle sub-element drops with proper element filtering', async () => {
      const items = [createMockItem('2', 2)]; // Moving element with id 2
      const targetElement = createMockItem('2', 1); // Use numeric ID that matches getSubElements call
      const target = createMockTarget(targetElement);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should be called twice - once for remove, once for insert
      expect(mockUpdateSubElements).toHaveBeenCalledTimes(2);

      // First call should remove the moved element from original location
      expect(mockUpdateSubElements).toHaveBeenNthCalledWith(1,
        [mockSubElements[0], mockSubElements[2]], // Elements 1 and 3 (element 2 removed)
        2
      );
    });

    it('should handle ordered drops for sub-elements with correct insertion', async () => {
      const items = [createMockItem('2', 2)]; // Moving element with id 2
      const targetElement = createMockItem('123', 1); // parentElement ID as number
      const target = createMockTarget(targetElement, 1); // Insert at index 1

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should insert the moved element at the correct position
      const expectedElements = [
        mockSubElements[0], // Element 1 stays at index 0
        mockSubElements[1], // Element 2 inserted at index 1
        mockSubElements[2], // Element 3 moves to index 2
      ];

      expect(mockUpdateSubElements).toHaveBeenLastCalledWith(expectedElements, 123);
    });

    it('should handle non-ordered drops for sub-elements by appending', async () => {
      const items = [createMockItem('2', 2)]; // Moving element with id 2
      const targetElement = createMockItem('123', 1);
      const target = createMockTarget(targetElement);

      mockIsOrderedDragTarget.mockReturnValue(false);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should append moved elements to the end
      const expectedElements = [
        mockSubElements[0], // Element 1
        mockSubElements[2], // Element 3
        mockSubElements[1], // Element 2 appended at end
      ];

      expect(mockUpdateSubElements).toHaveBeenLastCalledWith(expectedElements, 123);
    });

    it('should handle multiple sub-elements being moved', async () => {
      const items = [
        createMockItem('1', 2),
        createMockItem('3', 2)
      ]; // Moving elements 1 and 3
      const targetElement = createMockItem('456', 1);
      const target = createMockTarget(targetElement, 0); // Insert at beginning

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should insert both elements at the beginning, maintaining their relative order
      const expectedElements = [
        mockSubElements[0], // Element 1 inserted first
        mockSubElements[2], // Element 3 inserted second
        mockSubElements[1], // Element 2 remains
      ];

      expect(mockUpdateSubElements).toHaveBeenLastCalledWith(expectedElements, 456);
    });

    it('should handle case when getSubElements returns undefined', async () => {
      const items = [createMockItem('1', 2)];
      const targetElement = createMockItem('999', 1);
      const target = createMockTarget(targetElement);

      mockGetSubElements.mockReturnValue(undefined);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      // Should use empty array as fallback
      expect(mockUpdateSubElements).toHaveBeenCalledWith([], 999);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty items array', async () => {
      const items: ItemInstance<TreeItemData>[] = [];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      // Mock the insert callback to not call setFocused since there are no items
      mockInsertItemsAtTarget.mockImplementation(async (itemIds, target, callback) => {
        // For empty items array, don't simulate the root level callback that calls setFocused
        if (itemIds.length === 0) {
          return;
        }
        await callback(target.item as ItemInstance<unknown>, ['item1', 'item2', ...itemIds]);
      });

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockRemoveItemsFromParents).toHaveBeenCalledWith([], expect.any(Function));
      expect(mockInsertItemsAtTarget).toHaveBeenCalledWith([], target, expect.any(Function));
    });

    it('should handle items without valid IDs', async () => {
      const items = [createMockItem('', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockInsertItemsAtTarget).toHaveBeenCalledWith([''], target, expect.any(Function));
    });

    it('should handle async operations properly', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      // Make the mock functions async with delays
      mockRemoveItemsFromParents.mockImplementation(async (items, callback) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        await callback(items[0] as ItemInstance<unknown>, ['child1']);
      });

      mockInsertItemsAtTarget.mockImplementation(async (itemIds, target, callback) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        await callback(target.item as ItemInstance<unknown>, ['child1', ...itemIds]);
      });

      const startTime = Date.now();

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      const endTime = Date.now();

      // Should have waited for async operations
      expect(endTime - startTime).toBeGreaterThanOrEqual(20);
      expect(mockRemoveItemsFromParents).toHaveBeenCalled();
      expect(mockInsertItemsAtTarget).toHaveBeenCalled();
    });
  });

  describe('Callback function interactions', () => {
    it('should call all provided callback functions when appropriate', async () => {
      const items = [createMockItem('group1', 0)];
      const target = createMockTarget(createMockItem('root', -1), 1);

      mockIsOrderedDragTarget.mockReturnValue(true);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockGetSubElements).toHaveBeenCalled();
      expect(mockSetGroupsLayout).toHaveBeenCalled();
      expect(mockAutoFlowAll).toHaveBeenCalled();
      expect(mockUpdateGroupElements).not.toHaveBeenCalled(); // Not called for root level
      expect(mockUpdateSubElements).not.toHaveBeenCalled(); // Not called for root level
    });

    it('should pass correct parameters to callback functions', async () => {
      const items = [createMockItem('element1', 1)];
      const targetGroup = createMockItem('targetGroup', 0);
      const target = createMockTarget(targetGroup);

      await handleOnDrop(
        items,
        target,
        mockGetSubElements,
        mockSetGroupsLayout,
        mockUpdateGroupElements,
        mockUpdateSubElements,
        mockAutoFlowAll
      );

      expect(mockGetSubElements).toHaveBeenCalledWith(NaN); // targetGroup is not a valid number
      expect(mockUpdateGroupElements).toHaveBeenCalledWith({
        id: 'targetGroup',
        elements: expect.any(Array)
      });
    });
  });
});