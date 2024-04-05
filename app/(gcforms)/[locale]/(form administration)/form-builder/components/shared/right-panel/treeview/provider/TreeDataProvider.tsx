import React, {
  useMemo,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useState,
} from "react";
import { useGroupStore } from "../store/useGroupStore";
import { StaticTreeDataProvider, TreeItem } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { findParentGroup } from "../util/findParentGroup";
import { TreeDataProviderProps } from "../types";
import { TreeView } from "../TreeView";
import { useTreeRef } from "./TreeRefProvider";
import isEqual from "lodash.isequal";

const Wrapper: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = ({ children }, ref) => {
  const { getId, setId, getGroups, addGroup } = useGroupStore((s) => {
    return {
      getId: s.getId,
      setId: s.setId,
      getGroups: s.getGroups,
      addGroup: s.addGroup,
    };
  });

  const { tree } = useTreeRef();

  const [items, setItems] = useState(getGroups());

  const dataProvider = useMemo(() => {
    return new StaticTreeDataProvider(items, (item, data) => ({
      ...item,
      data,
    }));
  }, [items]);

  const injectItem = (itemId: string) => {
    const id = getId();

    const newItems = items;

    // @todo update this to add children current section
    if (newItems[id] && newItems[id].children !== undefined) {
      const children = newItems[id].children;
      children && children.push(itemId);
    }

    newItems[itemId] = {
      data: "New item",
      index: itemId,
      children: [],
      canMove: true,
      isFolder: false,
    };

    setItems(newItems);

    dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
  };

  useImperativeHandle(ref, () => ({
    addItem: (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      parent && tree?.current?.expandItem(parent.index);
      injectItem(id);
      parent && tree?.current?.focusItem(parent.index);
      // tree?.current?.selectItems([id]);
      return;
    },
    addGroup: (itemId: string) => {
      const newItems = getGroups();
      newItems[itemId] = {
        data: "New section",
        index: itemId,
        children: [],
        canMove: true,
        isFolder: true,
      };

      addGroup(itemId, "New section");
      setId(itemId);
      setItems(getGroups());

      if (newItems.root.children) {
        newItems.root.children.push(itemId);
        dataProvider.onChangeItemChildren("root", newItems.root.children);
        dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
        tree?.current?.selectItems([itemId]);
      }
    },
    updateItem: (id: string, value: string) => {
      const updatedItems = getGroups();
      if (isEqual(items, updatedItems)) {
        return;
      }
      dataProvider.onRenameItem(updatedItems[id], value);
      dataProvider.onDidChangeTreeDataEmitter.emit([id]);
    },
    removeItem: (id: string) => {
      const updatedItems = getGroups();
      const parent = findParentGroup(updatedItems, id);
      if (parent) {
        updatedItems[parent.index].children = updatedItems[parent.index].children?.filter(
          (child) => child !== id
        );
        setItems(updatedItems);

        const children = updatedItems[parent.index].children || [];
        dataProvider.onChangeItemChildren(parent.index, children);
        dataProvider.onDidChangeTreeDataEmitter.emit([parent.index]);
        tree?.current?.selectItems([parent.index]);
      }
    },
  }));

  return (
    <>
      <TreeView
        viewState={{}}
        dataProvider={dataProvider}
        onFocusItem={(item: TreeItem) => {
          if (item.isFolder) {
            setId(String(item.index));
          } else {
            const parent = findParentGroup(items, String(item.index));
            if (parent) {
              setId(String(parent.index));
            }
          }
        }}
      />
      {children}
    </>
  );
};

export const TreeDataProvider = forwardRef(Wrapper);
