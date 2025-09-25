import { describe, it, expect, vi } from 'vitest';
import { handleCanDrop } from './handleCanDrop';
import { DragTarget, ItemInstance, isOrderedDragTarget } from '@headless-tree/core';
import { TreeItemData } from '../types';

// Mock the headless-tree function
vi.mock('@headless-tree/core', async () => {
  const actual = await vi.importActual('@headless-tree/core');
  return {
    ...actual,
    isOrderedDragTarget: vi.fn(),
  };
});

const mockIsOrderedDragTarget = vi.mocked(isOrderedDragTarget);

// Helper to create mock ItemInstance
const createMockItem = (
  id: string,
  level: number,
  isFolder = false,
  data: Partial<TreeItemData> = {},
  parentId?: string
): ItemInstance<TreeItemData> => ({
  getId: () => id,
  getItemMeta: () => ({ level }),
  getItemData: () => ({ type: data.type, ...data }),
  isFolder: () => isFolder,
  getParent: () => parentId ? createMockItem(parentId, level - 1) : null,
  getChildren: () => [],
} as unknown as ItemInstance<TreeItemData>);

// Helper to create mock DragTarget
const createMockTarget = (
  targetItem: ItemInstance<TreeItemData>,
  insertionIndex?: number
): DragTarget<TreeItemData> => ({
  item: targetItem,
  ...(insertionIndex !== undefined && { insertionIndex }),
} as DragTarget<TreeItemData>);

describe('handleCanDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mixed item types validation', () => {
    it('should reject drag when mixing groups and non-groups', () => {
      const groupItem = createMockItem('group1', 0, true);
      const formItem = createMockItem('element1', 1, false);
      const target = createMockTarget(createMockItem('root', -1));

      const result = handleCanDrop([groupItem, formItem], target);

      expect(result).toBe(false);
    });

    it('should allow dragging multiple groups together', () => {
      const group1 = createMockItem('group1', 0, true);
      const group2 = createMockItem('group2', 0, true);
      const target = createMockTarget(createMockItem('root', -1));
      
      mockIsOrderedDragTarget.mockReturnValue(false);

      const result = handleCanDrop([group1, group2], target);

      expect(result).toBe(true);
    });

    it('should allow dragging multiple form elements together', () => {
      const element1 = createMockItem('element1', 1, false);
      const element2 = createMockItem('element2', 1, false);
      const target = createMockTarget(createMockItem('group1', 0));

      const result = handleCanDrop([element1, element2], target);

      expect(result).toBe(true);
    });

    it('should treat dynamicRow as non-group even if isFolder returns true', () => {
      const dynamicRowItem = createMockItem('dynamic1', 1, true, { type: 'dynamicRow' });
      const formItem = createMockItem('element1', 1, false);
      const target = createMockTarget(createMockItem('group1', 0));

      const result = handleCanDrop([dynamicRowItem, formItem], target);

      expect(result).toBe(true);
    });
  });

  describe('Level consistency validation', () => {
    it('should reject drag when items have different levels', () => {
      const level0Item = createMockItem('item1', 0);
      const level1Item = createMockItem('item2', 1);
      const target = createMockTarget(createMockItem('root', -1));

      const result = handleCanDrop([level0Item, level1Item], target);

      expect(result).toBe(false);
    });

    it('should allow drag when all items have the same level', () => {
      const level1Item1 = createMockItem('item1', 1);
      const level1Item2 = createMockItem('item2', 1);
      const target = createMockTarget(createMockItem('group1', 0));

      const result = handleCanDrop([level1Item1, level1Item2], target);

      expect(result).toBe(true);
    });
  });

  describe('Root level (level 0) drag validation', () => {
    it('should reject drop when target is not root', () => {
      const rootItem = createMockItem('group1', 0);
      const target = createMockTarget(createMockItem('not-root', -1));

      const result = handleCanDrop([rootItem], target);

      expect(result).toBe(false);
    });

    describe('Ordered drops', () => {
      const rootTarget = createMockItem('root', -1);
      const startChild = createMockItem('start', 0);
      const group1Child = createMockItem('group1', 0);
      const group2Child = createMockItem('group2', 0);
      const endChild = createMockItem('end', 0);

      beforeEach(() => {
        // Mock the getChildren method for root
        rootTarget.getChildren = () => [startChild, group1Child, group2Child, endChild];
      });

      it('should reject drop before Start (position 0)', () => {
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootTarget, 0);
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(false);
      });

      it('should reject drop at the very end (position equals length)', () => {
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootTarget, 4); // length = 4
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(false);
      });

      it('should reject drop at End position', () => {
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootTarget, 3); // End is at index 3
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(false);
      });

      it('should reject drop after End position', () => {
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootTarget, 4); // After End
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(false);
      });

      it('should allow drop between Start and End', () => {
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootTarget, 2); // Between groups
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(true);
      });

      it('should handle case when End item is not found', () => {
        const rootWithoutEnd = createMockItem('root', -1);
        rootWithoutEnd.getChildren = () => [startChild, group1Child, group2Child];
        
        const draggedItem = createMockItem('group3', 0);
        const target = createMockTarget(rootWithoutEnd, 2);
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(true);
      });
    });

    describe('Non-ordered drops', () => {
      it('should allow non-ordered drops on root', () => {
        const draggedItem = createMockItem('group1', 0);
        const target = createMockTarget(createMockItem('root', -1));
        mockIsOrderedDragTarget.mockReturnValue(false);

        const result = handleCanDrop([draggedItem], target);

        expect(result).toBe(true);
      });
    });
  });

  describe('Level 1 (form elements) drag validation', () => {
    it('should reject drop on End', () => {
      const formElement = createMockItem('element1', 1);
      const target = createMockTarget(createMockItem('end', 0));

      const result = handleCanDrop([formElement], target);

      expect(result).toBe(false);
    });

    describe('Drop on Start', () => {
      it('should reject drop before privacy (insertion index < 2)', () => {
        const formElement = createMockItem('element1', 1);
        const target = createMockTarget(createMockItem('start', 0), 1);
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([formElement], target);

        expect(result).toBe(false);
      });

      it('should allow drop after privacy (insertion index >= 2)', () => {
        const formElement = createMockItem('element1', 1);
        const target = createMockTarget(createMockItem('start', 0), 2);
        mockIsOrderedDragTarget.mockReturnValue(true);

        const result = handleCanDrop([formElement], target);

        expect(result).toBe(true);
      });

      it('should allow non-ordered drops on Start', () => {
        const formElement = createMockItem('element1', 1);
        const target = createMockTarget(createMockItem('start', 0));
        mockIsOrderedDragTarget.mockReturnValue(false);

        const result = handleCanDrop([formElement], target);

        expect(result).toBe(true);
      });
    });

    it('should allow drop on any root level item (level 0)', () => {
      const formElement = createMockItem('element1', 1);
      const rootLevelGroup = createMockItem('group1', 0);
      const target = createMockTarget(rootLevelGroup);

      const result = handleCanDrop([formElement], target);

      expect(result).toBe(true);
    });

    it('should reject drop on non-root level items', () => {
      const formElement = createMockItem('element1', 1);
      const nonRootItem = createMockItem('some-item', 1);
      const target = createMockTarget(nonRootItem);

      const result = handleCanDrop([formElement], target);

      expect(result).toBe(false);
    });
  });

  describe('Level 2 (sub-elements) drag validation', () => {
    it('should allow drop within same parent', () => {
      const parentId = 'parent1';
      const subElement = createMockItem('sub1', 2, false, {}, parentId);
      const target = createMockTarget(createMockItem(parentId, 1));

      const result = handleCanDrop([subElement], target);

      expect(result).toBe(true);
    });

    it('should reject drop to different parent', () => {
      const subElement = createMockItem('sub1', 2, false, {}, 'parent1');
      const target = createMockTarget(createMockItem('parent2', 1));

      const result = handleCanDrop([subElement], target);

      expect(result).toBe(false);
    });

    it('should handle case when item has no parent', () => {
      const subElement = createMockItem('sub1', 2, false, {});
      const target = createMockTarget(createMockItem('parent1', 1));

      const result = handleCanDrop([subElement], target);

      expect(result).toBe(false);
    });
  });

  describe('Invalid levels', () => {
    it('should reject drag for items at level > 2', () => {
      const deepItem = createMockItem('deep1', 3);
      const target = createMockTarget(createMockItem('some-target', 2));

      const result = handleCanDrop([deepItem], target);

      expect(result).toBe(false);
    });

    it('should reject drag for items at negative levels', () => {
      const negativeItem = createMockItem('neg1', -1);
      const target = createMockTarget(createMockItem('some-target', 0));

      const result = handleCanDrop([negativeItem], target);

      expect(result).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty items array', () => {
      const target = createMockTarget(createMockItem('root', -1));

      // This would likely cause an error in the current implementation
      // as it accesses items[0] without checking length
      expect(() => handleCanDrop([], target)).toThrow();
    });

    it('should handle target without children for root level drops', () => {
      const rootTarget = createMockItem('root', -1);
      rootTarget.getChildren = () => [];
      
      const draggedItem = createMockItem('group1', 0);
      const target = createMockTarget(rootTarget, 0);
      mockIsOrderedDragTarget.mockReturnValue(true);

      const result = handleCanDrop([draggedItem], target);

      expect(result).toBe(false); // Should reject drop before Start when no children
    });
  });
});