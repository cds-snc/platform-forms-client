import React, {
  useMemo,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useState,
} from "react";
import { useGroupStore } from "../store";
import { StaticTreeDataProvider, TreeItem } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { findParentGroup } from "../util/findParentGroup";
import { TreeDataProviderProps } from "../types";
import { TreeView } from "../TreeView";
import { useTreeRef } from "./TreeRefProvider";
import isEqual from "lodash.isequal";

const Wrapper: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children },
  ref
) => {
  const { getId, setId, getGroups, addGroup } = useGroupStore((s) => {
    return {
      getId: s.getId,
      setId: s.setId,
      getGroups: s.getGroups,
      addGroup: s.addGroup
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

      // console.log({ newItems });
      newItems[itemId] = {
        data: "New section",
        index: itemId,
        children: [],
        canMove: true,
        isFolder: true,
      };

      if (newItems.root.children) {
        newItems.root.children.push(itemId);
      }

      addGroup(itemId, "New section");
      setId(itemId);

      setItems(newItems);
      console.log({ items });
      dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
      // dataProvider.onDidChangeTreeDataEmitter.emit([itemId]);
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
      console.log("removeItem", id);
      const updatedItems = getGroups();
      console.log({ updatedItems });
      // delete updatedItems[id];
      updatedItems.start.children = updatedItems.start.children.filter((child) => child !== id);
      setItems(updatedItems);
      dataProvider.onDidChangeTreeDataEmitter.emit(["start"]);
      // dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
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
