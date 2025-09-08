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
import { createHeadlessDropHandler } from "./handlers/handleOnDrop";
import { createHeadlessCanDropHandler } from "./handlers/handleCanDropAt";

import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";

import { useTreeRef } from "../treeview/provider/TreeRefProvider";
import { Button } from "@root/components/clientComponents/globals";
import { AddIcon } from "@root/components/serverComponents/icons";
import { KeyboardNavTip } from "./KeyboardNavTip";
import { useTranslation } from "@root/i18n/client";

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
    updateElementTitle,
    groupId,
  } = useGroupStore((s) => ({
    getTreeData: s.getTreeData,
    selectedElementId: s.selectedElementId,
    updateGroupName: s.updateGroupName,
    getGroups: s.getGroups,
    replaceGroups: s.replaceGroups,
    getSubElements: s.getSubElements,
    updateSubElements: s.updateSubElements,
    getElement: s.getElement,
    updateElementTitle: s.updateElementTitle,
    groupId: s.id,
  }));

  const updateGroupTitle = useGroupStore((state) => state.updateGroupTitle);
  const { getLocalizationAttribute } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const language = getLocalizationAttribute()?.lang as Language;

  const { t } = useTranslation("form-builder");
  const newSectionText = t("groups.newPage");

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

      return level < 1 || data.isRepeatingSet || false;
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
      const data = item.getItemData();
      const id = item.getId();
      const parent = item.getParent()?.getId();

      // @TODO: check these different cases:

      // Handle title elements (section titles)
      if (data && typeof data === "object" && id.includes("section-title-")) {
        updateGroupTitle({ id: groupId, locale: language || "en", title: value });
        tree.rebuildTree();
        return;
      }

      // Handle root-level groups/folders
      if (
        parent === "root" &&
        data &&
        typeof data === "object" &&
        (!data.type || data.type === "group")
      ) {
        updateGroupName({ id, name: value });
        tree.rebuildTree();
        return;
      }

      // Handle form elements (including dynamicRow and sub-elements)
      if (data && typeof data === "object" && (data.type === "dynamicRow" || parent !== "root")) {
        updateElementTitle({
          id: Number(id),
          text: value,
        });
        tree.rebuildTree();
        return;
      }

      // Fallback for other cases
      updateGroupName({ id, name: value });
      tree.rebuildTree();
    },
    canDrag: (items) => {
      const lockedItems = ["start", "introduction", "policy", "review", "end", "confirmation"];
      return !items.some((item) => lockedItems.includes(item.getId()));
    },
    canRename: (item) => {
      const id = item.getId();
      // const data = item.getItemData();

      // Don't allow renaming of special sections
      if (["start", "end", "intro", "policy", "confirmation", "review"].includes(id)) {
        return false;
      }

      // @TODO: copilot suggested the following, not sure it's needed?
      // Don't allow renaming items with specific names that shouldn't be renamed
      // if (data && typeof data === "object" && data.name) {
      //   const itemName = String(data.name);
      //   if (
      //     ["Start", "Introduction", "Policy", "Review", "End", "Confirmation"].includes(itemName)
      //   ) {
      //     return false;
      //   }
      // }

      // Allow renaming for:
      // - Title elements (section titles)
      // - Root-level groups/sections (excluding special ones)
      // - Form elements and sub-elements
      // - Dynamic rows
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
      <div className="sticky top-0 z-10 flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
        <label className="flex items-center hover:fill-white hover:underline">
          <span className="mr-2 pl-3 text-sm">{newSectionText}</span>
          <Button
            theme="secondary"
            className="p-0 hover:!bg-indigo-500 hover:!fill-white focus:!fill-white"
            onClick={addPage}
          >
            <AddIcon className="hover:fill-white focus:fill-white" title={t("groups.addPage")} />
          </Button>
        </label>
        <KeyboardNavTip />
      </div>

      <div {...tree.getContainerProps()} className="w-full">
        <AssistiveTreeDescription tree={tree} />
        {children}
        <div>
          {tree.getItems().map((item) => (
            <TreeItem key={item.getId()} item={item} tree={tree} onFocus={setActiveGroup} />
          ))}
        </div>

        <div style={tree.getDragLineStyle()} className="dragline" />
      </div>
    </>
  );
};

export const TreeView = forwardRef(HeadlessTreeView);
