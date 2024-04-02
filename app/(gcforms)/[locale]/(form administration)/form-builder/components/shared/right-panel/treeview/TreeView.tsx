import React, { useMemo, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from "react";
import { Button } from "@clientComponents/globals";
import { v4 as uuid } from "uuid";
import { useGroupStore } from "./store";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useTreeRef } from "./provider/TreeRefProvider";
import { findParentGroup } from "./util/findParentGroup";
import { TreeWrapperProps } from "./types";

export const TreeView = ({
  dataProvider,
  onFocusItem,
}: {
  dataProvider: StaticTreeDataProvider;
  onFocusItem: (item: TreeItem) => void;
}) => {
  const { environment, tree } = useTreeRef();

  // This is only for testing purposes
  const getFocus = () => {
    if (!environment || !environment.current) return "Fruit";
    const state = environment.current.viewState;
    return (state["tree-1"] && state["tree-1"].focusedItem) || "Fruit";
  };

  // const testItems = groupsToTreeData({
  //   start: {
  //     name: "Start",
  //     elements: [],
  //   },
  //   group2: {
  //     name: "Group two",
  //     elements: [],
  //   },
  //   group3: {
  //     name: "Group three",
  //     elements: [],
  //   },
  // });

  return (
    <div className="relative mr-[1px]">
      <div className="m-4">
        <Button
          onClick={() => {
            if (tree && tree.current) {
              tree.current.expandItem(getFocus());
            }
          }}
        >
          Collapse focused Item
        </Button>

        <div>
          <div>
            <UncontrolledTreeEnvironment
              ref={environment}
              onFocusItem={onFocusItem}
              canDragAndDrop={true}
              canReorderItems={true}
              dataProvider={dataProvider}
              getItemTitle={(item) => item.data}
              viewState={{}}
            >
              <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
            </UncontrolledTreeEnvironment>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export const TreeWrapper = forwardRef(Wrapper);
