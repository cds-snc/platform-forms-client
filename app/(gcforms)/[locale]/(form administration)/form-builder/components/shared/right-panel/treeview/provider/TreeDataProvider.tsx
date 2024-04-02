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

const Wrapper: ForwardRefRenderFunction<unknown, TreeDataProviderProps> = (
  { children, ...rest },
  ref
) => {
  const { getGroups, getId, setId } = useGroupStore((s) => {
    return { getGroups: s.getGroups, getId: s.getId, setId: s.setId };
  });

  const { tree } = useTreeRef();

  const [items, setItems] = useState(getGroups());

  // const items = useMemo(() => getGroups(), []);

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

    const newItems = items;

    // @todo update this to add children current section
    if (newItems[id] && newItems[id].children !== undefined) {
      const children = newItems[id].children;
      children && children.push(itemId);
    }

    newItems[itemId] = {
      data: "New section",
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
      return;
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
