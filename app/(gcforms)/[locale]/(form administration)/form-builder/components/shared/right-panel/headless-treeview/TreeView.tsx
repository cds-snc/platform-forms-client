/**
 * Note this is a work in progress to move the tree view to a more accessible implementation.
 *
 * Docs - https://headless-tree.lukasbach.com/
 *
 * LLMs
 * https://headless-tree.lukasbach.com/llms.txt
 *
 * Full
 * https://headless-tree.lukasbach.com/llms-full.txt
 *
 */

import { ForwardRefRenderFunction, forwardRef, useImperativeHandle } from "react";

import { TreeItem } from "react-complex-tree";

import "./style.css";
import {
  syncDataLoaderFeature,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  renamingFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { cn } from "@lib/utils";
import { useTreeSync } from "./useTreeSync";

import { TreeDataProviderProps } from "../treeview/types";

import { getInitialTreeState, createSafeItemLoader, createSafeChildrenLoader } from "./treeUtils";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { getTreeData, updateGroup, selectedElementId, updateGroupName } = useGroupStore((s) => ({
    addGroup: s.addGroup,
    replaceGroups: s.replaceGroups,
    setId: s.setId,
    getGroups: s.getGroups,
    getTreeData: s.getTreeData,
    updateGroup: s.updateGroup,
    setSelectedElementId: s.setSelectedElementId,
    selectedElementId: s.selectedElementId,
    updateGroupName: s.updateGroupName,
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
    onRename: (item, newName) => {
      // Update the group name in the store when renamed
      updateGroupName({ id: item.getId(), name: newName });
    },
    indent: 20,
    dataLoader: {
      getItem: createSafeItemLoader(getTreeData),
      getChildren: createSafeChildrenLoader(getTreeData),
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      renamingFeature,
    ],
  });

  // Sync tree with external store changes
  const { addPage, onFocusItem } = useTreeSync(tree);

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
      addPage();
    },
  }));

  return (
    <>
      <button onClick={addPage}>Add Page</button>

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

          return item.isRenaming() ? (
            <div
              className="renaming-item"
              style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
            >
              <input {...item.getRenameInputProps()} />
            </div>
          ) : (
            <button
              key={item.getId()}
              id={item.getId()}
              {...item.getProps()}
              onFocus={() => {
                onFocusItem(item);
              }}
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
    </>
  );
};

export const TreeView = forwardRef(HeadlessTreeView);
