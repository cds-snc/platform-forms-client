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
import { data } from "./data";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { cn } from "@lib/utils";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  removeItem: (id: string) => void;
  addPage: () => void;
  refresh: () => void;
}

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
const HeadlessTreeView: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const getTreeData = useGroupStore((s) => s.getTreeData);

  const items = getTreeData({
    addIntroElement: true,
    addPolicyElement: true,
    addConfirmationElement: true,
    addSectionTitleElements: false,
    reviewGroup: false,
  });

  // const items = data;

  //console.log(items);

  const tree = useTree<TreeItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana", "orange"],
    },
    rootItemId: "root",
    getItemName: (item) => {
      // Todo: update to use lang
      // return item.getItemData()?.name;
      return item.getItemData()?.data.titleEn;
    },
    isItemFolder: (item) => !!item.getItemData()?.children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    indent: 20,
    dataLoader: {
      getItem: (itemId: string) => items[itemId],
      getChildren: (itemId: string): string[] => {
        const children = items[itemId]?.children;
        return children && children.length > 0 ? (children as string[]) : [];
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
