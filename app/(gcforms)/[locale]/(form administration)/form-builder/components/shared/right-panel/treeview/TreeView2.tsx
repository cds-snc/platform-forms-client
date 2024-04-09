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
import { TreeItems } from "./types";
import "react-complex-tree/lib/style-modern.css";

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
  const { getGroups, addGroup } = useGroupStore((s) => {
    return {
      getGroups: s.getGroups,
      addGroup: s.addGroup,
    };
  });

  const { tree, environment } = useTreeRef();

  const [items, setItems] = useState<TreeItems>(getGroups());
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>();
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([]);
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([]);

  // useEffect(() => {
  //   console.log({ items });
  // }, [items]);

  const addSection = () => {
    const id = uuid();
    addGroup(id, "New section");
    setItems(getGroups());
  };

  useImperativeHandle(ref, () => ({
    addItem: async () => {
      setItems(getGroups());
    },
    updateItem: () => {
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
      <button onClick={() => setItems(getGroups())}>Refresh</button>
      <button onClick={addSection}>Add section</button>
      <>{children}</>
    </ControlledTreeEnvironment>
  );
};

export const TreeView = forwardRef(ControlledTree);
