/**
 * Note this is a work in progress to move the tree view to a more accessible implementation.
 */

import "./style.css";
import {
  asyncDataLoaderFeature,
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
} from "@headless-tree/core";
import { DemoItem, asyncDataLoader, data } from "./data";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { cn } from "@lib/utils";

export const TreeView = ({ ref }: { ref: React.Ref<HTMLDivElement> }) => {
  const tree = useTree<DemoItem>({
    initialState: {
      expandedItems: ["fruit"],
      selectedItems: ["banana", "orange"],
    },
    rootItemId: "root",
    getItemName: (item) => item.getItemData()?.name,
    isItemFolder: (item) => !!item.getItemData()?.children,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    indent: 20,
    dataLoader: asyncDataLoader,
    features: [
      asyncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree" ref={ref}>
      <AssistiveTreeDescription tree={tree} />
      {tree.getItems().map((item) => (
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
      ))}
      <div style={tree.getDragLineStyle()} className="dragline" />
    </div>
  );
};
