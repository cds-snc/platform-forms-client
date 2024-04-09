import { ControlledTreeEnvironment, Tree, TreeItemIndex } from "react-complex-tree";
import { useGroupStore } from "./store/useGroupStore";
import {
  ForwardRefRenderFunction,
  ReactElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTreeRef } from "./provider/TreeRefProvider";
import { v4 as uuid } from "uuid";
import { TreeItems } from "./types";
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
  const { getGroups, addGroup, setId } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
      addGroup: s.addGroup,
      setId: s.setId,
    };
  });

  const { tree, environment } = useTreeRef();

  const [items, setItems] = useState<TreeItems>(getGroups());
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  useEffect(() => {
    console.log({ items });
    console.log({ focusedItem });
    console.log({ expandedItems });
    console.log({ selectedItems });
  }, [items, focusedItem, expandedItems, selectedItems]);

  const addSection = () => {
    const id = uuid();
    addGroup(id, "New section");
    setItems(getGroups());
    setSelectedItems([id]);
    setExpandedItems([id]);
    setId(id);
  };

  const refreshItems = () => {
    setItems(getGroups());
  };

  useImperativeHandle(ref, () => ({
    addItem: async (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      console.log({ parent });
      setExpandedItems([parent]);
      setSelectedItems([id]);
      setItems(getGroups());
    },
    updateItem: (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      setExpandedItems([parent]);
      setSelectedItems([id]);
      setItems(getGroups());
    },
  }));

  return (
    <ControlledTreeEnvironment
      ref={environment}
      items={items}
      getItemTitle={(item) => item.data}
      viewState={{
        ["default"]: {
          focusedItem,
          expandedItems,
          selectedItems,
        },
      }}
      onFocusItem={(item) => setFocusedItem(item.index)}
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
