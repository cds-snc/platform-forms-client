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
 * Notes:
 * old refs
 * tree?.current?. <- This to the instance of the Tree
 * treeView?.current?. <- This is the useImperativeHandle ref
 *
 */

import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle } from "react";

import "./style.css";

import { TreeItemData } from "./types";
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
import { useTreeHandlers } from "./useTreeHandlers";
import { TreeItem } from "./TreeItem";

import { TreeDataProviderProps } from "../treeview/types";

import { getInitialTreeState, createSafeItemLoader, createSafeChildrenLoader } from "./treeUtils";
import { createHeadlessDropHandler } from "./handleHeadlessDrop";
import { createHeadlessCanDropHandler } from "./handleHeadlessCanDrop";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";

import { useTreeRef } from "../treeview/provider/TreeRefProvider";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const {
    getTreeData,
    selectedElementId,
    updateGroupName,
    getGroups,
    replaceGroups,
    getSubElements,
    updateSubElements,
    getElement,
  } = useGroupStore((s) => ({
    getTreeData: s.getTreeData,
    selectedElementId: s.selectedElementId,
    updateGroupName: s.updateGroupName,
    getGroups: s.getGroups,
    replaceGroups: s.replaceGroups,
    getSubElements: s.getSubElements,
    updateSubElements: s.updateSubElements,
    getElement: s.getElement,
  }));

  const { getTitle } = useElementTitle();

  const { headlessTree } = useTreeRef();

  const tree = useTree<TreeItemData>({
    initialState: getInitialTreeState(selectedElementId),
    rootItemId: "root",
    getItemName: (item) => {
      const data = item.getItemData();
      // For headless-tree, the data is the actual data object
      if (data && typeof data === "object") {
        return getTitle(data as ElementProperties) || data.name || item.getId();
      }
      return item.getId();
    },
    isItemFolder: (item) => {
      const data = item.getItemData();
      const level = item.getItemMeta().level;

      // Root level sections/groups should be folders (can contain children)
      // But they should NOT accept other root-level items as children
      if (level === 0 && data && typeof data === "object") {
        // Check if this is a group/section vs a form element
        return !data.type || data.type === "group" || ["start", "end"].includes(String(data.name));
      }

      return level < 1;
    },
    canReorder: true,
    canDrop: (items, target) => {
      const canDropHandler = createHeadlessCanDropHandler(getGroups, getElement);
      const itemIds = items.map((item) => item.getId());

      // Extract target information from headless-tree target structure
      // If target.item exists, we're dropping ON an item (making it a child)
      // If target.item is null/undefined, we're dropping between items at root level
      let targetParentId: string;
      let targetIndex: number;

      if (target.item) {
        // Dropping ON an item - the item becomes the parent
        targetParentId = target.item.getId();
        targetIndex = "insertionIndex" in target ? target.insertionIndex : 0;
      } else {
        // Dropping between items - assume root level
        targetParentId = "root";
        targetIndex = "insertionIndex" in target ? target.insertionIndex : 0;
      }

      return canDropHandler(itemIds, targetParentId, targetIndex);
    },
    onDrop: createOnDropHandler(
      createHeadlessDropHandler(getGroups, replaceGroups, getSubElements, updateSubElements, () =>
        tree.rebuildTree()
      )
    ),
    onRename: (item, value) => {
      // Update the external store with the new name
      updateGroupName({ id: item.getId(), name: value });
      tree.rebuildTree();
    },
    canRename: (item) => {
      const id = item.getId();
      const parent = item.getParent()?.getId();

      if (parent !== "root") {
        return false;
      }

      if (["start", "end"].includes(id)) {
        return false;
      }
      return true;
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

  useEffect(() => {
    // Note: Type assertion needed during migration from react-complex-tree to headless-tree
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headlessTree && (headlessTree.current = tree as any);
  }, [headlessTree, tree]);

  // Sync tree with external store changes
  const { addPage, setActiveGroup } = useTreeHandlers(tree);

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
    addPage,
  }));

  return (
    <>
      <button onClick={addPage}>Add Page</button>

      <div {...tree.getContainerProps()} className="tree">
        <AssistiveTreeDescription tree={tree} />
        {children}
        {tree.getItems().map((item) => (
          <TreeItem key={item.getId()} item={item} tree={tree} onFocus={setActiveGroup} />
        ))}

        <div style={tree.getDragLineStyle()} className="dragline" />
      </div>
    </>
  );
};

export const TreeView = forwardRef(HeadlessTreeView);
