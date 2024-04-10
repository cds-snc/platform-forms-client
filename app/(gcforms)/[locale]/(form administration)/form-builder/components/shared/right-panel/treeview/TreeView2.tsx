import { ControlledTreeEnvironment, Tree, TreeItemIndex } from "react-complex-tree";
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
  const { getGroups, addGroup, setId, updateGroupName, updateElementTitle } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
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
    // setItems(getGroups());
    setSelectedItems([id]);
    setExpandedItems([id]);
    setId(id);
  };

  const refreshItems = () => {
    // setItems(getGroups());
  };

  useImperativeHandle(ref, () => ({
    addItem: async (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
      // setItems(getGroups());
    },
    updateItem: (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      setExpandedItems([parent?.index as TreeItemIndex]);
      setSelectedItems([id]);
      // setItems(getGroups());
    },
  }));

  return (
    <ControlledTreeEnvironment
      ref={environment}
      items={getGroups()}
      getItemTitle={(item) => item.data}
      viewState={{
        ["default"]: {
          focusedItem,
          expandedItems,
          selectedItems,
        },
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
      <button className="mr-2 rounded-md border border-slate-300 p-2" onClick={refreshItems}>
        Refresh
      </button>
      <button className="mr-2 rounded-md border border-slate-300 p-2" onClick={addSection}>
        Add section
      </button>
      <>{children}</>
    </ControlledTreeEnvironment>
  );
};

export const TreeView = forwardRef(ControlledTree);
