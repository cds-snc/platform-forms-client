import { cn } from "@lib/utils";
import { TreeItemData, TreeItemInstance } from "../types";

export const useStyles = (item: TreeItemInstance<TreeItemData>) => {
  const isSubElement = item?.getItemData().isSubElement;

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

  return { itemIndent, itemSpacing, formElementClasses, sectionElementClasses };
};
