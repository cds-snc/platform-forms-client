/**
 * Note this is a work in progress to move the tree view to a more accessible implementation.
 */

import { ForwardRefRenderFunction, forwardRef, useImperativeHandle, ReactElement } from "react";

import { TreeItem } from "react-complex-tree";

import "./style.css";
import {
  syncDataLoaderFeature,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { cn } from "@lib/utils";
import { useTreeSync } from "./useTreeSync";
import { getInitialTreeState } from "./treeUtils";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  removeItem: (id: string) => void;
  addPage: () => void;
}

const treeOptions = {
  addIntroElement: true,
  addPolicyElement: true,
  addConfirmationElement: true,
  addSectionTitleElements: false,
  reviewGroup: false,
};

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { getTreeData, updateGroup, selectedElementId } = useGroupStore((s) => ({
    getTreeData: s.getTreeData,
    updateGroup: s.updateGroup,
    setSelectedElementId: s.setSelectedElementId,
    selectedElementId: s.selectedElementId,
  }));

  const tree = useTree<TreeItem>({
    initialState: getInitialTreeState(selectedElementId),
    rootItemId: "root",
    getItemName: (item) => {
      // Todo: update to use lang
      // return item.getItemData()?.name;
      const itemData = item.getItemData();
      if (!itemData || !itemData.data) {
        return ""; // Return empty string for deleted/invalid items
      }
      return itemData.data.titleEn || "";
    },
    isItemFolder: (item) => {
      const itemData = item.getItemData();
      return !!(itemData && itemData.children);
    },
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      // Update your external store when items are dropped
      updateGroup(item.getId(), newChildren);
    }),
    indent: 20,
    dataLoader: {
      getItem: (itemId: string) => {
        try {
          const items = getTreeData(treeOptions);

          // Always ensure we return something, never undefined
          if (!items) {
            // Return a placeholder item for missing data
            return {
              index: itemId,
              canMove: false,
              canRename: false,
              data: { titleEn: "", titleFr: "" },
              children: [],
              isFolder: false,
            };
          }

          const item = items[itemId];

          // If item doesn't exist, return a placeholder
          if (item === undefined || item === null) {
            return {
              index: itemId,
              canMove: false,
              canRename: false,
              data: { titleEn: "", titleFr: "" },
              children: [],
              isFolder: false,
            };
          }

          return item;
        } catch (error) {
          // Return placeholder for errors
          return {
            index: itemId,
            canMove: false,
            canRename: false,
            data: { titleEn: "", titleFr: "" },
            children: [],
            isFolder: false,
          };
        }
      },
      getChildren: (itemId: string): string[] => {
        try {
          const items = getTreeData(treeOptions);

          // If items is null/undefined, return empty array
          if (!items) {
            return [];
          }

          const item = items[itemId];

          // If parent item doesn't exist, return empty array
          if (!item || item === null) {
            return [];
          }

          const children = item.children;
          return Array.isArray(children) ? children.map(String) : [];
        } catch (error) {
          // Always return empty array, never undefined
          return [];
        }
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  // Sync tree with external store changes
  useTreeSync(tree);

  useImperativeHandle(ref, () => ({
    addItem: async () => {
      tree.rebuildTree();
    },
    updateItem: () => {
      tree.rebuildTree();
    },
    removeItem: () => {
      tree.rebuildTree();
    },
    addPage: () => {
      tree.rebuildTree();
    },
  }));

  return (
    <div {...tree.getContainerProps()} className="tree">
      <AssistiveTreeDescription tree={tree} />
      {children}
      {tree.getItems().map((item) => {
        // Skip rendering items that don't have valid data
        try {
          const itemData = item.getItemData();
          if (!itemData || !itemData.data) {
            return null;
          }
        } catch (error) {
          // If getItemData throws an error, skip this item
          return null;
        }

        return (
          <button
            key={item.getId()}
            {...item.getProps()}
            style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
          >
            <div
              className={cn("treeitem", {
                focused: item.isFocused(),
                expanded: item.isExpanded(),
                selected: item.isSelected(),
                folder: item.isFolder(),
                drop: item.isDragTarget(),
              })}
            >
              {item.getItemName()}
            </div>
          </button>
        );
      })}
      <div style={tree.getDragLineStyle()} className="dragline" />
    </div>
  );
};

export const TreeView = forwardRef(HeadlessTreeView);
