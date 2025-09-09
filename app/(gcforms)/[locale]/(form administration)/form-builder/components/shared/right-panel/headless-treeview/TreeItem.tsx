import { cn } from "@lib/utils";

import { TreeInstance } from "@headless-tree/core";
import { TreeItemData, TreeItemInstance } from "./types";

import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { ItemActions } from "./ItemActions";
import { ItemTitle } from "./ItemTitle";
import { Hamburger } from "./icons/Hamburger";
// import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";

interface TreeItemProps {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  onFocus: (item: TreeItemInstance<TreeItemData>) => void;
  handleDelete?: (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>
  ) => Promise<void>;
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

export const TreeItem = ({ item, tree, onFocus, handleDelete }: TreeItemProps) => {
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

  const isRepeatingSet = item.getItemData().isRepeatingSet;
  const isSubElement = item?.getItemData().isSubElement;

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

  const itemIndent = cn(
    !item.isFolder() && "ml-4 mr-4",
    item.getItemData().isRepeatingSet && "ml-4 mr-4",
    isSubElement && "border-l-2 border-indigo-700 mr-4"
  );

  const itemSpacing = cn("py-1");

  const formElementClasses = cn(
    "flex items-center rounded-md bg-white px-4 w-full text-left cursor-pointer relative outline-none border-1",
    item.isSelected() && "border-2 border-slate-950 bg-white",
    !item.isSelected() &&
      "border-slate-500 hover:border-indigo-700 hover:border-1 hover:bg-indigo-50",
    item.isFocused() && "border-indigo-700 border-2 font-bold bg-gray-50 text-indigo-700",
    isSubElement && "ml-2 w-[98%]"
  );

  const sectionElementClasses = cn(
    "flex items-center w-full relative cursor-pointer",
    item.isFocused() && "font-bold",
    ""
  );

  return (
    <div
      key={item.getId()}
      id={item.getId()}
      {...(!item.isRenaming() && {
        ...item.getProps(),
        onFocus: () => {
          onFocus(item);
        },
        onDoubleClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          tree.getItemInstance(item.getId()).startRenaming();
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (handleDelete) {
              e.preventDefault();
              handleDelete(e as React.KeyboardEvent<HTMLDivElement>);
            }
          }
        },
      })}
      className={cn(
        "block max-w-full",
        isFormElement && "outline-none",
        isSectionElement && "outline-indigo-700 outline-offset-[-4px]"
      )}
    >
      <div className={cn(itemIndent)}>
        <div
          className={cn(
            itemSpacing,
            !item.isExpanded() && isSectionElement && "border-b-1 border-slate-300"
          )}
        >
          <div
            data-selected={item.isSelected()}
            data-focused={item.isFocused()}
            className={cn(
              isFormElement && formElementClasses,
              isSectionElement && sectionElementClasses
            )}
          >
            {isSectionElement && (
              <span className="mx-2 inline-block">
                {item.isExpanded() ? <ArrowDown /> : <ArrowRight />}
              </span>
            )}
            {isRepeatingSet && (
              <span className="mr-2 inline-block">
                <Hamburger />
              </span>
            )}
            {item.isRenaming() && (
              <div key={item.getId()} className="w-5/6">
                <input
                  className="m-2 block w-full select-all rounded-md border-2 border-indigo-700 p-2 font-normal outline-none"
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
            )}

            {!item.isRenaming() && (
              <>
                <ItemTitle
                  isFolder={item.isFolder() || item.getItemData().isRepeatingSet || false}
                  title={item.getItemName()}
                  isFormElement={isFormElement}
                  fieldType={fieldType}
                  id={item.getId()}
                />
                <ItemActions
                  item={item}
                  tree={tree}
                  arrow={undefined}
                  lockClassName={""}
                  handleDelete={isRepeatingSet ? undefined : handleDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
