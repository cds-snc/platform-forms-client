import {
  ForwardRefRenderFunction,
  ReactElement,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { useGroupStore } from "./store/useGroupStore";
import { useTreeRef } from "./provider/TreeRefProvider";
import { v4 as uuid } from "uuid";
import { findParentGroup } from "./util/findParentGroup";
import { GroupsType } from "@lib/formContext";
import { Item } from "./Item";
import { SubItem } from "./SubItem";
import { autoFlowGroupNextActions } from "./util/setNextAction";
import { AddIcon } from "@serverComponents/icons";
import { handleCanDropAt } from "./handlers/handleCanDropAt";
import { handleOnDrop } from "./handlers/handleOnDrop";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";
import { ConfirmMoveSectionDialog } from "../../confirm/ConfirmMoveSectionDialog";
import { useConfirmState as useConfirmMoveDialogState } from "../../confirm/useConfirmState";
import { useConfirmState as useConfirmDeleteDialogState } from "../../confirm/useConfirmState";
import { ConfirmDeleteSectionDialog } from "../../confirm/ConfirmDeleteSectionDialog";
import { toast } from "@formBuilder/components/shared";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { KeyboardNavTip } from "./KeyboardNavTip";
import { Button } from "@clientComponents/globals";
import { Language } from "@lib/types/form-builder-types";
import { isTitleElementType } from "./util/itemType";
import { useAutoFlowIfNoCustomRules } from "@lib/hooks/useAutoFlowAll";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useUpdateGroupLayout } from "./util/useUpdateGroupLayout";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  removeItem: (id: string) => void;
  addPage: () => void;
}

const ControlledTree: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const {
    groupId,
    getTreeData,
    getGroups,
    addGroup,
    setId,
    updateGroupName,
    replaceGroups,
    updateElementTitle,
    deleteGroup,
  } = useGroupStore((s) => {
    return {
      groupId: s.id,
      getTreeData: s.getTreeData,
      getGroups: s.getGroups,
      replaceGroups: s.replaceGroups,
      addGroup: s.addGroup,
      setId: s.setId,
      updateGroupName: s.updateGroupName,
      updateElementTitle: s.updateElementTitle,
      deleteGroup: s.deleteGroup,
    };
  });

  const updateGroupTitle = useGroupStore((state) => state.updateGroupTitle);
  const { getLocalizationAttribute } = useTemplateStore((s) => ({
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const language = getLocalizationAttribute()?.lang as Language;

  const { remove: removeItem } = useTemplateStore((s) => {
    return {
      remove: s.remove,
    };
  });

  const { t } = useTranslation("form-builder");
  const { tree, environment } = useTreeRef();
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const { getTitle } = useElementTitle();
  const { autoFlowAll } = useAutoFlowIfNoCustomRules();
  const { updateGroupsLayout } = useUpdateGroupLayout();

  const newSectionText = t("groups.newPage");

  const addPage = () => {
    const id = uuid();
    addGroup(id, newSectionText);
    const newGroups = autoFlowGroupNextActions(getGroups() as GroupsType, id);
    replaceGroups(newGroups);
    setSelectedItems([id]);
    setExpandedItems([id]);
    setId(id);
    tree?.current?.startRenamingItem(id);
  };

  useImperativeHandle(ref, () => ({
    addItem: async (id: string) => {
      const parent = findParentGroup(getTreeData(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
    },
    updateItem: (id: string) => {
      const parent = findParentGroup(getTreeData(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
    },
    removeItem: (id: string) => {
      const parent = findParentGroup(getTreeData(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([parent?.index as TreeItemIndex]);
    },
    addPage: () => {
      addPage();
    },
  }));

  const {
    resolve: resolveConfirmMove,
    getPromise: getConfirmMovePromise,
    openDialog: openConfirmMoveDialog,
    setOpenDialog: setOpenConfirmMoveDialog,
  } = useConfirmMoveDialogState();
  const {
    resolve: resolveConfirmDelete,
    getPromise: getConfirmDeletePromise,
    openDialog: openConfirmDeleteDialog,
    setOpenDialog: setOpenConfirmDeleteDialog,
  } = useConfirmDeleteDialogState();

  const items = getTreeData({
    addIntroElement: true,
    addPolicyElement: true,
    addConfirmationElement: true,
    addSectionTitleElements: false,
    reviewGroup: false,
  });

  if (!items) {
    return null;
  }

  return (
    <div
      onFocus={() => {
        updateGroupsLayout();
      }}
      onBlur={() => {
        updateGroupsLayout();
      }}
    >
      <ControlledTreeEnvironment
        ref={environment}
        items={items}
        getItemTitle={(item) => getTitle(item?.data as ElementProperties)}
        renderItem={({ item, title, arrow, context, children }) => {
          if (item.data.isSubElement) {
            return (
              <SubItem
                title={title}
                arrow={arrow}
                context={context}
                handleDelete={async () => {
                  // @todo handle delete for sub elements
                  return;
                }}
              >
                {children}
              </SubItem>
            );
          }

          return (
            <Item
              title={title}
              arrow={arrow}
              context={context}
              handleDelete={async (e) => {
                e.stopPropagation();
                setOpenConfirmDeleteDialog(true);
                const confirm = await getConfirmDeletePromise();
                if (confirm) {
                  item.children &&
                    item.children.map((child) => {
                      removeItem(Number(child));
                    });

                  deleteGroup(String(item.index));

                  // When deleting a group, we need to select the previous group
                  const itemsArray = Object.keys(items);
                  const deletedItemIndex = itemsArray.indexOf(String(item.index));
                  const previousItemId =
                    deletedItemIndex > 0 ? itemsArray[deletedItemIndex - 1] : "start";
                  setSelectedItems([previousItemId]);
                  setExpandedItems([previousItemId]);
                  setId(previousItemId);

                  // And update the groups layout
                  await updateGroupsLayout();

                  autoFlowAll();
                  setOpenConfirmDeleteDialog(false);
                  toast.success(
                    <>
                      <h3>{t("groups.groupDeleted")}</h3>
                      <p>{t("groups.groupSuccessfullyDeleted", { group: item.data.name })}</p>
                    </>
                  );

                  return;
                }
                setOpenConfirmDeleteDialog(false);
              }}
            >
              {children}
            </Item>
          );
        }}
        renderItemTitle={({ title }) => <Item.Title title={title} />}
        renderItemArrow={({ item, context }) => {
          if (item.data.type === "dynamicRow") {
            return <SubItem.Arrow item={item} context={context} />;
          }

          return <Item.Arrow item={item} context={context} />;
        }}
        renderLiveDescriptorContainer={() => null}
        renderDragBetweenLine={({ lineProps }) => {
          return (
            <div {...lineProps}>
              <div className="absolute left-0 -ml-2 -mt-2 size-0 border-y-8 border-l-8 border-y-transparent border-l-blue-focus" />
              <div className={cn("w-full border-b-1 border-blue-focus")} />
            </div>
          );
        }}
        renderItemsContainer={({ children, containerProps }) => {
          return (
            <ul className="m-0 p-0" {...containerProps}>
              {children}
            </ul>
          );
        }}
        viewState={{
          ["default"]: {
            focusedItem,
            expandedItems,
            selectedItems,
          },
        }}
        canDragAndDrop={true}
        canReorderItems={true}
        canDrag={(items: TreeItem[]) => {
          return items.some((item) => {
            return !["Start", "Introduction", "Policy", "Review", "End", "Confirmation"].includes(
              item.data.name
            );
          });
        }}
        canDropAt={(treeItems, target) => handleCanDropAt(treeItems, target, getGroups)}
        canDropBelowOpenFolders={true}
        canDropOnFolder={true}
        onRenameItem={(item, name) => {
          if (!item) return;
          const isTitleElement = isTitleElementType(item);
          if (isTitleElement) {
            updateGroupTitle({ id: groupId, locale: language || "en", title: name });
            setSelectedItems([item.index]);
            return;
          }

          item.isFolder && updateGroupName({ id: String(item.index), name });
          // Rename the element
          !item.isFolder &&
            updateElementTitle({
              id: Number(item.index),
              text: name,
            });

          setSelectedItems([item.index]);
        }}
        onDrop={async (items: TreeItem[], target: DraggingPosition) => {
          await handleOnDrop(
            items,
            target,
            getGroups,
            replaceGroups,
            setSelectedItems,
            setExpandedItems,
            expandedItems,
            getTreeData,
            getConfirmMovePromise,
            setOpenConfirmMoveDialog,
            autoFlowAll
          );

          updateGroupsLayout();
        }}
        onFocusItem={(item) => {
          const parent = findParentGroup(getTreeData(), String(item.index));
          setFocusedItem(item.index);

          if (item.data.type === "dynamicRow") {
            setFocusedItem(item.index);
            setId(String(parent?.index));
            return;
          }

          if (item.data.isSubElement) {
            const subParent = findParentGroup(getTreeData(), String(item.data.parentId));
            setId(String(subParent?.index));
            return;
          }

          if (item.index === "intro" || item.index === "policy") {
            setId("start");
            return;
          }

          if (item.index === "confirmation") {
            setId("end");
            return;
          }

          setId(item.isFolder ? String(item.index) : String(parent?.index));
        }}
        onExpandItem={(item) => {
          if (item.index !== groupId && item.data.type !== "dynamicRow") {
            setId(String(item.index));
          }

          setExpandedItems([...expandedItems, item.index]);
        }}
        onCollapseItem={(item) =>
          setExpandedItems(
            expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item.index)
          )
        }
        onSelectItems={(items) => {
          setSelectedItems(items);
        }}
      >
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
        <div id="tree-container">
          <Tree treeId="default" rootItem="root" treeLabel={t("groups.treeAriaLabel")} ref={tree} />
        </div>
        <>{children}</>
      </ControlledTreeEnvironment>
      <ConfirmMoveSectionDialog
        open={openConfirmMoveDialog}
        handleClose={(value) => {
          if (value) {
            resolveConfirmMove && resolveConfirmMove(true);
          } else {
            resolveConfirmMove && resolveConfirmMove(false);
          }
        }}
      />
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
    </div>
  );
};

export const TreeView = forwardRef(ControlledTree);
