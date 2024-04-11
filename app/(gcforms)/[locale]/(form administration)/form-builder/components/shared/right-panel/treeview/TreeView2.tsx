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
      getItemTitle={(item) => item.index}
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
        // console.log({ target });

        const currentItems = getGroups();
        // console.log({ currentItems });

        const itemsIndices = items.map((i) => i.index);
        // console.log({ itemsIndices });

        const { parentItem: targetParent, childIndex: targetIndex } =
          target as DraggingPositionBetweenItems;
        // console.log({ targetParent });
        // console.log({ targetIndex });

        items.forEach((item) => {
          const originParent = findParentGroup(currentItems, String(item.index));
          // console.log({ parent: originParent });

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

          // Remove items from their original positions
          const originIndex = originParent.children.indexOf(String(item.index));
          // console.log({ originIndex });

          if (originIndex === -1) {
            throw Error(`Item "${item.index}" not found in parent "${originParent.index}"`);
          }

          if (target.targetType === "between-items") {
            const newParent = currentItems[target.parentItem];
            const isOldItemPriorToNewItem =
              ((newParent.children ?? []).findIndex((child) => child === item.index) ?? Infinity) <
              target.childIndex;
            itemsPriorToInsertion += isOldItemPriorToNewItem ? 1 : 0;
          }

          originParent.children.splice(originIndex, 1);
          updateGroup(originParent.index, originParent.children);
        });

        // Insert items into new position
        const newParent = currentItems[targetParent];
        // console.log({ newParent });

        if (!newParent.children) {
          newParent.children = [];
        }

        // console.log(itemsIndices);

        newParent.children.splice(targetIndex - itemsPriorToInsertion, 0, ...itemsIndices);
        // console.log({ newParent });

        updateGroup(targetParent, newParent.children);
        setSelectedItems([targetParent]);
        // console.log(getGroups());
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
