import React, { useMemo, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import { v4 as uuid } from "uuid";
import { useGroupStore } from "../store";
import { StaticTreeDataProvider, TreeItem } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { findParentGroup } from "../util/findParentGroup";
import { TreeWrapperProps } from "../types";
import { TreeView } from "../TreeView";

const Wrapper: ForwardRefRenderFunction<unknown, TreeWrapperProps> = (
  { children, ...rest },
  ref
) => {
  const { getGroups, getId, setId } = useGroupStore((s) => {
    return { getGroups: s.getGroups, getId: s.getId, setId: s.setId };
  });

  const items = useMemo(() => getGroups(), []);

  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(items, (item, data) => ({
        ...item,
        data,
      })),
    [items]
  );

  const injectItem = (itemId: string) => {
    const id = getId();
    items[itemId] = {
      data: "New section",
      index: itemId,
      children: [],
      canMove: true,
      isFolder: false,
    };

    // @todo update this to add children current section
    if (items[id] && items[id].children !== undefined) {
      const children = items[id].children;
      children && children.push(itemId);
    }

    dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
  };

  useImperativeHandle(ref, () => ({
    addItem: () => {
      const itemId = uuid();
      return injectItem(itemId);
    },
  }));

  return (
    <div {...rest}>
      <TreeView
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
    </div>
  );
};

export const TreeDataProvider = forwardRef(Wrapper);
