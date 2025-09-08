import { cn } from "@lib/utils";

import { TreeInstance } from "@headless-tree/core";
import { TreeItemData, TreeItemInstance } from "./types";

import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { ItemActions } from "./ItemActions";
import { ItemTitle } from "./ItemTitle";
import { useLocalize } from "./useLocalize";

// import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";

interface TreeItemProps {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  onFocus: (item: TreeItemInstance<TreeItemData>) => void;
}

const isTitleElementType = (item: TreeItemInstance<TreeItemData>) => {
  const key = item?.getId() as string;
  if (!key) return false;
  return key.includes("section-title-");
};

const isFormElementType = (item: TreeItemInstance<TreeItemData>) => {
  const data = item.getItemData();
  if (data.type === "dynamicRow") return true;
  return item?.isFolder() && !isTitleElementType(item) ? false : true;
};

export const isSectionElementType = (item: TreeItemInstance<TreeItemData>) => {
  return item?.isFolder() && item.getItemData().type !== "dynamicRow" ? true : false;
};

export const TreeItem = ({ item, tree, onFocus }: TreeItemProps) => {
  const { localizedTitle, localizedDescription } = useLocalize();

  // const { refs } = useRefsContext();

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

  const isFormElement = item ? isFormElementType(item) : false;
  const isSectionElement = item ? isSectionElementType(item) : false;
  const fieldType = (item ? item?.getItemData().type : "") || "";

  // const isSubElement = item?.getItemData().isSubElement;

  const titleText = item?.getItemData()[localizedTitle] || "";
  const descriptionText =
    (isFormElement && (item ? item?.getItemData()[localizedDescription] : "")) || "";

  /*
  const handleScroll = useCallback(() => {
    if (refs && refs.current) {
      const el = refs?.current?.[Number(item.getId)];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [refs, item]);
  */

  const formElementClasses = cn(
    "flex items-center rounded-md px-3 w-5/6 border-1 bg-white min-h-[50px]",
    item.isFocused() && "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
    item.isSelected() && "border-2 border-slate-950 bg-white",
    !item.isSelected() &&
      "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50"
  );

  const interactiveSectionElementClasses = cn(
    "w-full relative",
    !item.isExpanded() && "border-b-1 border-slate-200"
  );

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
    <div
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
      className="block h-[60px] w-full"
    >
      <div
        className={cn(
          "px-4 py-2 w-full text-left cursor-pointer flex items-center justify-center",
          isFormElement && formElementClasses,
          isSectionElement && interactiveSectionElementClasses,
          !item.isFolder() && "ml-10"
          // item.isFolder() && "border-t-1 border-slate-200"
          // {
          //   focused: item.isFocused(),
          //   expanded: item.isExpanded(),
          //   selected: item.isSelected(),
          //   folder: item.isFolder(),
          //   drop: item.isDragTarget(),
          // }
        )}
      >
        {item.isFolder() && (
          <span className="mr-2 inline-block">
            {item.isExpanded() ? <ArrowDown /> : <ArrowRight />}
          </span>
        )}
        <ItemTitle
          isFolder={item.isFolder()}
          title={fieldType === "richText" ? descriptionText : titleText}
          isFormElement={isFormElement}
          fieldType={fieldType}
          id={item.getId()}
        />
        <ItemActions
          item={item}
          tree={tree}
          arrow={undefined}
          lockClassName={""}
          handleDelete={async (e) => {
            e.stopPropagation();
            alert("delete");
          }}
        />
      </div>
    </div>
  );
};
