import React, { useMemo, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { TreeItem } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { findParentGroup } from "../util/findParentGroup";
import { TreeDataProviderProps } from "../types";
import { TreeView } from "../TreeView";
import { useTreeRef } from "./TreeRefProvider";
import { CustomStaticTreeDataProvider } from "./CustomDataProvider";

const Wrapper: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = ({ children }, ref) => {
  const { setId, getGroups, addGroup } = useGroupStore((s) => {
    return {
      getId: s.getId,
      setId: s.setId,
      getGroups: s.getGroups,
      addGroup: s.addGroup,
    };
  });

  const { tree } = useTreeRef();

  const dataProvider = useMemo(() => {
    return new CustomStaticTreeDataProvider(getGroups(), (item, data) => ({
      ...item,
      data,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    addItem: async (id: string) => {
      const parent = findParentGroup(getGroups(), id);
      if (parent) {
        const groups = getGroups();
        dataProvider.setItems(groups);

        const children = groups[parent.index].children || [id];

        dataProvider.onDidChangeTreeDataEmitter.emit([parent.index]);

        dataProvider.onChangeItemChildren(parent.index, children);

        tree?.current?.expandItem(parent.index);
        tree?.current?.selectItems([id]);
      }
    },
    addGroup: (itemId: string) => {
      addGroup(itemId, "New section");
      setId(itemId);
      const groups = getGroups();
      dataProvider.setItems(groups);

      if (groups.root.children) {
        dataProvider.onChangeItemChildren("root", groups.root.children);
        dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
        // tree?.current?.expandItem(itemId);
        // tree?.current?.selectItems([itemId]);
      }
    },
    updateItem: (id: string, value: string) => {
      const updatedItems = getGroups();
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
        delete updatedItems[id];
        dataProvider.setItems(updatedItems);

        const children = updatedItems[parent.index].children || [];
        dataProvider.onChangeItemChildren(parent.index, children);
        dataProvider.onDidChangeTreeDataEmitter.emit([parent.index]);
        tree?.current?.selectItems([parent.index]);
        tree?.current?.expandItem(parent.index);
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
            const parent = findParentGroup(getGroups(), String(item.index));
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
