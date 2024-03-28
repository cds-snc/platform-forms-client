import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@clientComponents/globals";
import { v4 as uuid } from "uuid";
import { useGroupStore } from "./store";

// import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  TreeItemIndex,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";

const testItems = {
  root: {
    index: "root",
    canMove: true,
    isFolder: true,
    children: ["child1", "child2"],
    data: "Root item",
    canRename: true,
  },
  child1: {
    index: "child1",
    canMove: true,
    isFolder: false,
    children: [],
    data: "Child item 1",
    canRename: true,
  },
  child2: {
    index: "child2",
    canMove: true,
    isFolder: false,
    children: [],
    data: "Child item 2",
    canRename: true,
  },
};

type TreeItems = Record<TreeItemIndex, TreeItem>;

export const TreeView = () => {
  const items: TreeItems = useMemo(() => testItems, []);

  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(items, (item, data) => ({
        ...item,
        data,
      })),
    [items]
  );

  const injectItem = (id: string) => {
    items[id] = { data: "New Item", index: id };
    if (items.root.children === undefined) items.root.children = [];
    items.root.children.push(id);
    dataProvider.onDidChangeTreeDataEmitter.emit(["root"]);
  };

  /*
  const removeItem = () => {
    if (items.root.children.length === 0) return;
    items.root.children.pop();
    dataProvider.onDidChangeTreeDataEmitter.emit(['root']);
  };
  */

  const { t } = useTranslation("form-builder");

  // const { groups, addGroup, controllers } = useDynamicTree();
  const { setId } = useGroupStore((s) => {
    return { id: s.id, setId: s.setId };
  });

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            const id = uuid();
            injectItem(id);
            setId(id);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>

        <div>
          <div>
            <UncontrolledTreeEnvironment
              onPrimaryAction={(item) => {
                setId(String(item.index));
              }}
              canDragAndDrop={true}
              canReorderItems={true}
              dataProvider={dataProvider}
              getItemTitle={(item) => item.data}
              viewState={{}}
            >
              <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>
          </div>
        </div>
      </div>
    </div>
  );
};
