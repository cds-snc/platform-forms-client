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
  DraggingPositionBetweenItems,
  Tree,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import { useGroupStore } from "./store/useGroupStore";
import { useTreeRef } from "./provider/TreeRefProvider";
import { v4 as uuid } from "uuid";
import { findParentGroup } from "./util/findParentGroup";
import "react-complex-tree/lib/style-modern.css";
import { Group, GroupsType } from "@lib/formContext";
// import { Item } from "./Item";

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  // addGroup: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  // removeItem: (id: string) => void;
  // openSection?: (id: string) => void;
}

const findItemIndex = (items: string[], itemIndex: string | number) =>
  items.indexOf(String(itemIndex));

const isOldItemPriorToNewItem = (
  items: string[],
  itemIndex: string | number,
  targetIndex: number
) => (items.findIndex((child) => child === itemIndex) ?? Infinity) < targetIndex;

const removeItemAtIndex = (items: string[], index: number) => {
  const updatedItems = [...items];
  updatedItems.splice(index, 1);
  return updatedItems;
};

const insertItemAtIndex = (items: string[], item: string, index: number) => {
  const updatedItems = [...items];
  updatedItems.splice(index, 0, item);
  return updatedItems;
};

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

  const addSection = () => {
    const id = uuid();
    addGroup(id, "New section");
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
  }));

  return (
    <ControlledTreeEnvironment
      ref={environment}
      items={getTreeData()}
      getItemTitle={(item) => item.data}
      // renderItem={({ title, arrow, context, children }) => {
      //   return (
      //     <Item title={title} arrow={arrow} context={context}>
      //       {children}
      //     </Item>
      //   );
      // }}
      // renderItemTitle={({ title }) => <Item.Title title={title} />}
      // renderItemArrow={({ item, context }) => <Item.Arrow item={item} context={context} />}
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
          return (
            item.data !== "Start" &&
            item.data !== "Introduction" &&
            item.data !== "Policy" &&
            item.data !== "End" &&
            item.data !== "Confirmation"
          );
        });
      }}
      canDropAt={(items, target) => {
        const folderItemsCount = items.filter((item) => item.isFolder).length;
        const nonFolderItemsCount = items.filter((item) => !item.isFolder).length;

        // Can't drag mixed item types
        if (folderItemsCount > 0 && nonFolderItemsCount > 0) {
          return false;
        }

        // If any of the selected items is a folder, disallow dropping on a folder
        if (folderItemsCount >= 1) {
          const { parentItem } = target as DraggingPositionBetweenItems;
          if (items[0].isFolder && parentItem !== "root") {
            return false;
          }
        }

        // If any of the items is not a folder, disallow dropping on root
        if (nonFolderItemsCount >= 1) {
          if (target.depth === 0) {
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
        // Current state of the tree in Groups format
        let currentGroups = getGroups() as GroupsType;

        // Target parent and index
        const { parentItem: targetParent, childIndex: targetIndex } =
          target as DraggingPositionBetweenItems;

        let newGroups: GroupsType;
        const selectedItems: string[] = [];

        // Dragging/dropping root-level items
        if (targetParent === "root") {
          let elements = Object.keys(currentGroups);

          let itemsPriorToInsertion = 0;

          items.forEach((item, index) => {
            // Original location
            const originIndex = findItemIndex(elements, item.index);

            // Adjust index if dragging down
            itemsPriorToInsertion += isOldItemPriorToNewItem(elements, item.index, targetIndex)
              ? 1
              : 0;

            // Remove from old position
            elements = removeItemAtIndex(elements, originIndex);

            // Insert at new position
            elements = insertItemAtIndex(
              elements,
              String(item.index),
              targetIndex - itemsPriorToInsertion + index
            );

            selectedItems.push(String(item.index));
          });

          // Create a new Groups object
          newGroups = elements.reduce((acc: GroupsType, key) => {
            const data = currentGroups[key] as Group;
            acc[key] = data;
            return acc;
          }, {});

          replaceGroups(newGroups);
          setSelectedItems(selectedItems);

          return;
        }

        // Dragging/dropping other non-root level items
        const targetParentGroup = currentGroups[targetParent];
        let targetGroupElements = [...targetParentGroup.elements];

        let itemsPriorToInsertion = 0;

        let originParentGroup;
        let originGroupElements: string[] = [];

        items.forEach((item, index) => {
          // Remove item from original location
          const originParent = findParentGroup(getTreeData(), String(item.index));
          originParentGroup = currentGroups[originParent?.index as string];

          // Dragging/dropping item within same group
          if (originParentGroup == targetParentGroup) {
            originGroupElements = (originParent?.children || []) as string[];
            const originIndex = originGroupElements.indexOf(String(item.index));

            // Adjust index if dragging down
            itemsPriorToInsertion += isOldItemPriorToNewItem(
              targetGroupElements,
              item.index,
              targetIndex
            )
              ? 1
              : 0;

            // Remove item from previous location
            originGroupElements = removeItemAtIndex(originGroupElements, originIndex);

            // Insert item at new location
            originGroupElements = insertItemAtIndex(
              originGroupElements,
              String(item.index),
              targetIndex - itemsPriorToInsertion + index
            );

            // Create a new Groups object
            const newGroups = { ...currentGroups };
            newGroups[String(originParent?.index)] = {
              name: String(originParent?.index),
              elements: originGroupElements,
            };

            // Replace the original groups object
            currentGroups = newGroups;

            // Target/Origin groups are the same
            targetGroupElements = originGroupElements;

            selectedItems.push(String(item.index));

            // Replace the groups object and set selected items.
            replaceGroups(newGroups);

            return;
          }

          // Dragging/dropping item between groups
          originGroupElements = (originParent?.children || []) as string[];
          const originIndex = originGroupElements.indexOf(String(item.index));

          // Adjust index if dragging down
          itemsPriorToInsertion += isOldItemPriorToNewItem(
            targetGroupElements,
            item.index,
            targetIndex
          )
            ? 1
            : 0;

          // Remove item from previous location
          originGroupElements = removeItemAtIndex(originGroupElements, originIndex);

          // Create a new Groups object
          let newGroups = { ...currentGroups };
          newGroups[String(originParent?.index)] = {
            name: String(originParent?.index),
            elements: originGroupElements,
          };

          // Replace the original groups object
          currentGroups = newGroups;

          // Insert at new position
          targetGroupElements = insertItemAtIndex(
            targetGroupElements,
            String(item.index),
            targetIndex + index
          );

          newGroups = { ...currentGroups };
          newGroups[targetParentGroup.name] = {
            name: targetParentGroup.name,
            elements: targetGroupElements,
          };

          selectedItems.push(String(item.index));

          replaceGroups(newGroups);
        });

        setSelectedItems(selectedItems);
      }}
      onFocusItem={(item) => {
        setFocusedItem(item.index);
        const parent = findParentGroup(getTreeData(), String(item.index));
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
      <Tree treeId="default" rootItem="root" treeLabel="GC Forms sections" ref={tree} />
      <button className="ml-2 mt-2 rounded-md border border-slate-500 p-2" onClick={addSection}>
        New section
      </button>
      <>{children}</>
    </ControlledTreeEnvironment>
  );
};

export const TreeView = forwardRef(ControlledTree);
