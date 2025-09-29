import { useEffect } from "react";
import { TreeItemData } from "./types";
import {
  syncDataLoaderFeature,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  renamingFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { useTreeHandlers } from "./hooks/useTreeHandlers";
import { TreeItem } from "./TreeItem/TreeItem";
import { getInitialTreeState, createSafeItemLoader, createSafeChildrenLoader } from "./treeUtils";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useTranslation } from "@root/i18n/client";
import { canDeleteGroup } from "@lib/groups/utils/validateGroups";
import { useConfirmState as useConfirmDeleteDialogState } from "../../confirm/useConfirmState";
import { ConfirmDeleteSectionDialog } from "../../confirm/ConfirmDeleteSectionDialog";
import { useAutoFlowIfNoCustomRules } from "@lib/hooks/useAutoFlowAll";
import { handleCanDrop } from "./handlers/handleCanDrop";
import { handleOnDrop } from "./handlers/handleOnDrop";
import { scrollIntoViewFeature } from "./features/scrollIntoViewFeature";
import { dragAndDropFixFeature } from "./features/dragAndDropFixFeature";
import { TreeActions } from "./TreeActions";
import { groupsHaveCustomRules } from "@lib/groups/utils/setNextAction";
import { handleDelete } from "./handlers/handleDelete";
import { lockedGroups, lockedItems } from "./constants";

export const HeadlessTreeView = ({ children }: { children?: React.ReactNode }) => {
  const { t } = useTranslation("form-builder");

  const {
    getTreeData,
    id,
    updateGroupName,
    getGroups,
    getSubElements,
    updateSubElements,
    updateElementTitle,
    updateGroupElements,
    deleteGroup,
    setId,
  } = useGroupStore((s) => ({
    getTreeData: s.getTreeData,
    id: s.id,
    updateGroupName: s.updateGroupName,
    getGroups: s.getGroups,
    getSubElements: s.getSubElements,
    updateSubElements: s.updateSubElements,
    updateElementTitle: s.updateElementTitle,
    updateGroupElements: s.updateGroupElements,
    deleteGroup: s.deleteGroup,
    setId: s.setId,
  }));

  const { setGroupsLayout } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
    setGroupsLayout: s.setGroupsLayout,
  }));

  const { autoFlowAll } = useAutoFlowIfNoCustomRules();
  const { getTitle } = useElementTitle();
  const { headlessTree, startRenamingNewGroup } = useTreeRef();

  const tree = useTree<TreeItemData>({
    initialState: getInitialTreeState(id ?? "start"),
    rootItemId: "root",
    getItemName: (item) => {
      const data = item.getItemData();
      // For headless-tree, the data is the actual data object
      if (data && typeof data === "object") {
        return getTitle(data as ElementProperties) || data.name || "";
      }
      return "";
    },
    isItemFolder: (item) => {
      const data = item.getItemData();
      const level = item.getItemMeta().level;

      // Root level sections/groups should be folders (can contain children)
      // But they should NOT accept other root-level items as children
      if (level === 0 && data && typeof data === "object") {
        // Check if this is a group/section vs a form element
        return !data.type || data.type === "group" || lockedGroups.includes(String(data.name));
      }

      return level < 1 || data.isRepeatingSet || false;
    },
    canReorder: true,
    canDrop: (items, target) => handleCanDrop(items, target),
    onDrop: (items, target) =>
      handleOnDrop(
        items,
        target,
        getSubElements,
        setGroupsLayout,
        updateGroupElements,
        updateSubElements,
        autoFlowAll
      ),
    onRename: (item, value) => {
      const data = item.getItemData();
      const id = item.getId();
      const parent = item.getParent()?.getId();

      // Handle root-level groups/folders
      if (parent === "root" && data && (!data.type || data.type === "group")) {
        updateGroupName({ id, name: value });
        return;
      }

      // Handle form elements (including dynamicRow and sub-elements)
      if (data && (data.type === "dynamicRow" || parent !== "root")) {
        updateElementTitle({
          id: Number(id),
          text: value,
        });
        return;
      }

      return;
    },
    canDrag: (items) => {
      return !items.some((item) => lockedItems.includes(item.getId()));
    },
    canRename: (item) => {
      const id = item.getId();

      // Don't allow renaming of special sections/elements
      if (lockedItems.includes(id)) {
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
      scrollIntoViewFeature,
      dragAndDropFixFeature,
    ],
  });

  const { remove: removeElement } = useTemplateStore((s) => {
    return {
      remove: s.remove,
    };
  });

  const {
    resolve: resolveConfirmDelete,
    getPromise: getConfirmDeletePromise,
    openDialog: openConfirmDeleteDialog,
    setOpenDialog: setOpenConfirmDeleteDialog,
  } = useConfirmDeleteDialogState();

  useEffect(() => {
    headlessTree && (headlessTree.current = tree);
  }, [headlessTree, tree]);

  // Sync tree with external store changes
  const { setActiveGroup, addPage } = useTreeHandlers();

  const addGroup = () => {
    const id = addPage();
    setId(id);

    startRenamingNewGroup && startRenamingNewGroup(id);
  };

  return (
    <>
      <TreeActions addPage={addGroup} />
      <div {...tree.getContainerProps()} className="w-full">
        {children}
        <div className="py-2">
          <AssistiveTreeDescription tree={tree} />
          {tree.getItems().map((item) => (
            <TreeItem
              key={item.getId()}
              item={item}
              tree={tree}
              onFocus={setActiveGroup}
              handleDelete={async (e) => {
                const deletedItemName = item.getItemName();

                e.stopPropagation();
                await handleDelete(
                  item,
                  getGroups,
                  groupsHaveCustomRules,
                  canDeleteGroup,
                  setOpenConfirmDeleteDialog,
                  getConfirmDeletePromise,
                  removeElement,
                  deleteGroup,
                  setId,
                  autoFlowAll,
                  tree,
                  () => {
                    toast.success(
                      <div>
                        <h3>{t("groups.groupDeleted")}</h3>
                        <p>{t("groups.groupSuccessfullyDeleted", { group: deletedItemName })}</p>
                      </div>
                    );
                  },
                  () => {
                    toast.error(t("groups.cannotDeleteGroup"));
                  }
                );
              }}
            />
          ))}
          <div style={tree.getDragLineStyle()} className="border-b-2 border-blue-400" />
        </div>
      </div>
      <ConfirmDeleteSectionDialog
        open={openConfirmDeleteDialog}
        handleClose={(value) => {
          if (value) {
            resolveConfirmDelete && resolveConfirmDelete(true);
          } else {
            resolveConfirmDelete && resolveConfirmDelete(false);
          }
        }}
      />
    </>
  );
};
