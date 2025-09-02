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
import { useTreeHandlers } from "./useTreeHandlers";

import { TreeDataProviderProps } from "../treeview/types";

import { getInitialTreeState, createSafeItemLoader, createSafeChildrenLoader } from "./treeUtils";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";

import { useTreeRef } from "../treeview/provider/TreeRefProvider";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { getTreeData, updateGroup, selectedElementId } = useGroupStore((s) => ({
    addGroup: s.addGroup,
    replaceGroups: s.replaceGroups,
    setId: s.setId,
    getGroups: s.getGroups,
    getTreeData: s.getTreeData,
    updateGroup: s.updateGroup,
    setSelectedElementId: s.setSelectedElementId,
    selectedElementId: s.selectedElementId,
  }));

  const { getTitle } = useElementTitle();

  const { headlessTree } = useTreeRef();

  const tree = useTree<TreeItem>({
    initialState: getInitialTreeState(selectedElementId),
    rootItemId: "root",
    getItemName: (item) => getTitle(item.getItemData().data as ElementProperties),
    isItemFolder: (item) => item.getItemMeta().level < 1,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      // Update your external store when items are dropped
      updateGroup(item.getId(), newChildren);
    }),
    onRename: (item, value) => {
      alert(`Renamed ${item.getItemName()} to ${value}`);
      // @todo add rename logic
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
    headlessTree && (headlessTree.current = tree);
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
              key={item.getId()}
              className="renaming-item"
              style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
            >
              {/* Render EditableInput.tsx */}
              <input {...item.getRenameInputProps()} />
            </div>
          ) : (
            <button
              key={item.getId()}
              id={item.getId()}
              {...item.getProps()}
              onFocus={() => {
                setActiveGroup(item);
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
