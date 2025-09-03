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

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";

import { useTreeRef } from "../treeview/provider/TreeRefProvider";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { getTreeData, selectedElementId, updateGroupName } = useGroupStore((s) => ({
    getTreeData: s.getTreeData,
    selectedElementId: s.selectedElementId,
    updateGroupName: s.updateGroupName,
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
    isItemFolder: (item) => item.getItemMeta().level < 1,
    canReorder: true,
    onDrop: createOnDropHandler((_item, _newChildren) => {
      // Update your external store when items are dropped
      // updateGroup(item.getId(), newChildren);
    }),
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
