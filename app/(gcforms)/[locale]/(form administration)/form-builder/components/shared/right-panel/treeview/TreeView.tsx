import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@clientComponents/globals";
import { v4 as uuid } from "uuid";
import { useGroupStore } from "./store";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { groupsToTreeData } from "./util/groupsToTreeData";
import { useTreeRef } from "./provider/TreeRefProvider";

import { TreeItems } from "./types";

export const TreeView = () => {
  const { environment, tree } = useTreeRef();

  // This is only for testing purposes
  const getFocus = () => {
    if (!environment || !environment.current) return "Fruit";
    const state = environment.current.viewState;
    return (state["tree-1"] && state["tree-1"].focusedItem) || "Fruit";
  };

  const testItems = groupsToTreeData({
    start: {
      name: "Start",
      elements: [],
    },
    group2: {
      name: "Group two",
      elements: [],
    },
    group3: {
      name: "Group three",
      elements: [],
    },
  });

  const items = useMemo(() => testItems, []);

  const { setId, getId } = useGroupStore((s) => {
    return { setId: s.setId, getId: s.getId };
  });

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

  /*
  const removeItem = () => {
    if (items.root.children.length === 0) return;
    items.root.children.pop();
    dataProvider.onDidChangeTreeDataEmitter.emit(['root']);
  };
  */

  const { t } = useTranslation("form-builder");

  // const { groups, addGroup, controllers } = useDynamicTree();

  const findParentGroup = (groups: TreeItems, id: string) => {
    for (const [, group] of Object.entries(groups)) {
      if (group.children) {
        for (const child of group.children) {
          if (child === id) {
            return group;
          }
        }
      }
    }
  };

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

        <Button
          theme="secondary"
          onClick={() => {
            const itemId = uuid();

            injectItem(itemId);
            // setId(id); // @TODO: should this be parent or current?
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>

        <div>
          <div>
            <UncontrolledTreeEnvironment
              ref={environment}
              onFocusItem={(item) => {
                if (item.isFolder) {
                  setId(String(item.index));
                } else {
                  const parent = findParentGroup(items, String(item.index));
                  if (parent) {
                    setId(String(parent.index));
                  }
                }
              }}
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
