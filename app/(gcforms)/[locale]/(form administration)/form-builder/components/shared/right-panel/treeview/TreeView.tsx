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
import "react-complex-tree/lib/style-modern.css";
import { GroupsType } from "@lib/formContext";
import { Item } from "./Item";
import { autoFlowGroupNextActions } from "./util/setNextAction";
import { AddIcon } from "@serverComponents/icons";
import { handleCanDropAt } from "./handlers/handleCanDropAt";
import { handleOnDrop } from "./handlers/handleOnDrop";
import { ElementProperties, useElementTitle } from "@lib/hooks/useElementTitle";
import { ConfirmDialog } from "../../confirm/ConfirmDialog";
import { useConfirmState } from "../../confirm/useConfirmState";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  // addGroup: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  removeItem: (id: string) => void;
  // openSection?: (id: string) => void;
}

const ControlledTree: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  // export const TreeView = () => {
  const {
    getTreeData,
    getGroups,
    addGroup,
    setId,
    updateGroupName,
    replaceGroups,
    updateElementTitle,
  } = useGroupStore((s) => {
    return {
      getTreeData: s.getTreeData,
      getGroups: s.getGroups,
      replaceGroups: s.replaceGroups,
      addGroup: s.addGroup,
      setId: s.setId,
      updateGroupName: s.updateGroupName,
      updateElementTitle: s.updateElementTitle,
    };
  });

  const { tree, environment } = useTreeRef();
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const { getTitle } = useElementTitle();

  const addSection = () => {
    const id = uuid();
    addGroup(id, "New section");
    const newGroups = autoFlowGroupNextActions(getGroups() as GroupsType, id);
    replaceGroups(newGroups);
    setSelectedItems([id]);
    setExpandedItems([id]);
    setId(id);
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
  }));

  const { resolve, getPromise, openDialog, setOpenDialog } = useConfirmState();

  return (
    <>
      <ControlledTreeEnvironment
        ref={environment}
        items={getTreeData({
          addIntroElement: true,
          addPolicyElement: true,
          addConfirmationElement: true,
          reviewGroup: false,
        })}
        getItemTitle={(item) => getTitle(item.data as ElementProperties)}
        renderItem={({ title, arrow, context, children }) => {
          return (
            <Item title={title} arrow={arrow} context={context}>
              {children}
            </Item>
          );
        }}
        renderItemTitle={({ title }) => <Item.Title title={title} />}
        renderItemArrow={({ item, context }) => <Item.Arrow item={item} context={context} />}
        renderLiveDescriptorContainer={() => null}
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
        canDropAt={(items, target) => handleCanDropAt(items, target, getGroups)}
        onRenameItem={(item, name) => {
          item.isFolder && updateGroupName({ id: String(item.index), name });

          // Rename the element
          !item.isFolder &&
            updateElementTitle({
              id: Number(item.index),
              text: name,
            });

          setSelectedItems([item.index]);
        }}
        onDrop={async (items: TreeItem[], target: DraggingPosition) =>
          handleOnDrop(
            items,
            target,
            getGroups,
            replaceGroups,
            setSelectedItems,
            getTreeData,
            getPromise,
            setOpenDialog
          )
        }
        onFocusItem={(item) => {
          setFocusedItem(item.index);
          const parent = findParentGroup(getTreeData(), String(item.index));

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
        onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
        onCollapseItem={(item) =>
          setExpandedItems(
            expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item.index)
          )
        }
        onSelectItems={(items) => {
          setSelectedItems(items);
        }}
      >
        <div className="mb-4 flex justify-between align-middle">
          <label>
            New section
            <button
              className="ml-2 mt-2 rounded-md border border-slate-500 p-1"
              onClick={addSection}
            >
              <AddIcon title="Add section" />
            </button>
          </label>
        </div>

        <div className="border-1 border-slate-200">
          <Tree treeId="default" rootItem="root" treeLabel="GC Forms sections" ref={tree} />
        </div>
        <>{children}</>
      </ControlledTreeEnvironment>
      <ConfirmDialog
        open={openDialog}
        handleClose={(value) => {
          if (value) {
            resolve && resolve(true);
          } else {
            resolve && resolve(false);
          }
        }}
      ></ConfirmDialog>
    </>
  );
};

export const TreeView = forwardRef(ControlledTree);
