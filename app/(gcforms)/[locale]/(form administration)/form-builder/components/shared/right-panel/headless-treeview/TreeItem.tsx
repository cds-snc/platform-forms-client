import { TreeInstance } from "@headless-tree/core";
import { cn } from "@lib/utils";
import { TreeItemData, TreeItemInstance } from "./types";

interface TreeItemProps {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  onFocus: (item: TreeItemInstance<TreeItemData>) => void;
}

export const TreeItem = ({ item, tree, onFocus }: TreeItemProps) => {
  // Skip rendering items that don't have valid data
  try {
    const itemData = item.getItemData();
    if (!itemData) {
      return null;
    }
  } catch (error) {
    // If getItemData throws an error, skip this item
    return null;
  }

  if (item.isRenaming()) {
    return (
      <div
        key={item.getId()}
        className="renaming-item"
        style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
      >
        <input
          {...item.getRenameInputProps()}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tree.completeRenaming();
            } else if (e.key === "Escape") {
              e.preventDefault();
              tree.abortRenaming();
            }
          }}
          onBlur={() => {
            tree.completeRenaming();
          }}
        />
      </div>
    );
  }

  return (
    <button
      key={item.getId()}
      id={item.getId()}
      {...item.getProps()}
      onFocus={() => {
        onFocus(item);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        tree.getItemInstance(item.getId()).startRenaming();
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
};
