/**
 * Note this is a work in progress to move the tree view to a more accessible implementation.
 */

import { ForwardRefRenderFunction, forwardRef, useImperativeHandle } from "react";
import { v4 as uuid } from "uuid";

import { TreeItem } from "react-complex-tree";
import { type GroupsType } from "@gcforms/types";
import { useTranslation } from "@i18n/client";

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

import { TreeDataProviderProps } from "../treeview/types";

import { getInitialTreeState, createSafeItemLoader, createSafeChildrenLoader } from "./treeUtils";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

import { autoFlowGroupNextActions } from "../treeview/util/setNextAction";

const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { t } = useTranslation("form-builder");
  const { addGroup, replaceGroups, setId, getGroups, getTreeData, updateGroup, selectedElementId } =
    useGroupStore((s) => ({
      addGroup: s.addGroup,
      replaceGroups: s.replaceGroups,
      setId: s.setId,
      getGroups: s.getGroups,
      getTreeData: s.getTreeData,
      updateGroup: s.updateGroup,
      setSelectedElementId: s.setSelectedElementId,
      selectedElementId: s.selectedElementId,
    }));

  const newSectionText = t("groups.newPage");

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
      getItem: createSafeItemLoader(getTreeData),
      getChildren: createSafeChildrenLoader(getTreeData),
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

  const addPage = () => {
    const id = uuid();
    addGroup(id, newSectionText);
    const newGroups = autoFlowGroupNextActions(getGroups() as GroupsType, id);
    replaceGroups(newGroups);
    // setSelectedItems([id]);
    //setExpandedItems([id]);
    setId(id);
    tree.getItemInstance(id).startRenaming();
  };

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
      // eslint-disable-next-line no-console
      console.log("Adding page");
      addPage();
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
