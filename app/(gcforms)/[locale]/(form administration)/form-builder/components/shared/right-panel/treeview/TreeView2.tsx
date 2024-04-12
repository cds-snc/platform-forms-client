import {
  ControlledTreeEnvironment,
  DraggingPosition,
  DraggingPositionBetweenItems,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { useGroupStore } from "./store/useGroupStore";
import {
  ForwardRefRenderFunction,
  ReactElement,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useTreeRef } from "./provider/TreeRefProvider";
import { v4 as uuid } from "uuid";
import "react-complex-tree/lib/style-modern.css";
import { findParentGroup } from "./util/findParentGroup";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  // addGroup: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  // removeItem: (id: string) => void;
  // openSection?: (id: string) => void;
}

const ControlledTree: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  // export const TreeView = () => {
  const { getGroups, addGroup, setId, updateGroupName, updateGroup, updateElementTitle } =
    useGroupStore((s) => {
      return {
        getGroups: s.getGroups,
        addGroup: s.addGroup,
        setId: s.setId,
        updateGroupName: s.updateGroupName,
        updateElementTitle: s.updateElementTitle,
        updateGroup: s.updateGroup,
      };
    });

  const { tree, environment } = useTreeRef();
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  const addSection = () => {
    const id = uuid();
    addGroup(id, "New section");
    setSelectedItems([id]);
    setExpandedItems([id]);
    setId(id);
  };

  useImperativeHandle(ref, () => ({
    addItem: async (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
    },
    updateItem: (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
    },
  }));

  return (
    <ControlledTreeEnvironment
      ref={environment}
      items={getGroups()}
      getItemTitle={(item) => item.data}
      renderLiveDescriptorContainer={() => {
        return null;
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
        return items.some((item) => item.data !== "Start");
      }}
      canDropAt={(items, target) => {
        const folderItemsCount = items.filter((item) => item.isFolder).length;

        // if any of the selected items is a folder, disallow dropping on a folder
        if (folderItemsCount > 1) {
          const { parentItem } = target as DraggingPositionBetweenItems;
          if (items[0].isFolder && parentItem !== "root") {
            return false;
          }
        }

        return true;
      }}
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
      onDrop={async (items: TreeItem[], target: DraggingPosition) => {
        let itemsPriorToInsertion = 0;

        // current state of the tree
        const currentItems = getGroups();

        // Ids of the items being dragged
        const itemsIndices = items.map((i) => i.index);

        // Target parent and index
        const { parentItem: targetParentIndex, childIndex: targetIndex } =
          target as DraggingPositionBetweenItems;

        // Loop over the items being dragged
        items.forEach((item) => {
          // Find the parent of the item being dragged
          const originParent = findParentGroup(currentItems, String(item.index));

          if (!originParent) {
            throw Error(`Could not find parent of item "${item.index}"`);
          }

          if (!originParent.children) {
            throw Error(
              `Parent "${originParent.index}" of item "${item.index}" did not have any children`
            );
          }

          if (target.targetType === "between-items" && target.parentItem === item.index) {
            // Trying to drop inside itself
            return;
          }

          // Origin index of the item being dragged
          const originIndex = originParent.children.indexOf(String(item.index));

          if (originIndex === -1) {
            throw Error(`Item "${item.index}" not found in parent "${originParent.index}"`);
          }

          // Get the target parent
          const targetParent = currentItems[targetParentIndex];

          // Adjust the index if the item is being moved to a position after itself
          const isOldItemPriorToNewItem =
            ((targetParent.children ?? []).findIndex((child) => child === item.index) ?? Infinity) <
            targetIndex;
          itemsPriorToInsertion += isOldItemPriorToNewItem ? 1 : 0;

          // Remove the item from the origin parent
          originParent.children.splice(originIndex, 1);

          // Update groups
          updateGroup(originParent.index, originParent.children);
        });

        // Get the new state of the tree
        const newItems = getGroups();

        // Get the target parent in the new state
        const targetParent = newItems[targetParentIndex];

        // Initialize children if there are none
        if (!targetParent.children) {
          targetParent.children = [];
        }

        // Insert the items into the target parent
        targetParent.children.splice(targetIndex - itemsPriorToInsertion, 0, ...itemsIndices);

        // Update groups
        updateGroup(targetParentIndex, targetParent.children);

        // Set selected to trigger a re-render
        setSelectedItems([targetParentIndex]);
      }}
      onFocusItem={(item) => {
        setFocusedItem(item.index);
        const parent = findParentGroup(getGroups(), String(item.index));
        setId(item.isFolder ? String(item.index) : String(parent?.index));
      }}
      onExpandItem={(item) => setExpandedItems([...expandedItems, item.index])}
      onCollapseItem={(item) =>
        setExpandedItems(
          expandedItems.filter((expandedItemIndex) => expandedItemIndex !== item.index)
        )
      }
      onSelectItems={(items) => setSelectedItems(items)}
    >
      <Tree treeId="default" rootItem="root" treeLabel="Tree Example" ref={tree} />
      <button className="mr-2 rounded-md border border-slate-300 p-2" onClick={addSection}>
        Add section
      </button>
      <>{children}</>
    </ControlledTreeEnvironment>
  );
};

export const TreeView = forwardRef(ControlledTree);
