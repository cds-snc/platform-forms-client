import React from "react";
import { Button } from "@clientComponents/globals";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  IndividualTreeViewState,
  DraggingPosition,
  DraggingPositionItem,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useGroupStore } from "./store";
import { v4 as uuid } from "uuid";

export const TreeView = ({
  dataProvider,
  viewState,
  onFocusItem,
}: {
  dataProvider: StaticTreeDataProvider;
  viewState: IndividualTreeViewState;
  onFocusItem: (item: TreeItem) => void;
}) => {
  const { environment, tree, wrapper } = useTreeRef();

  // This is only for testing purposes
  const getFocus = () => {
    if (!environment || !environment.current) return "Fruit";
    const state = environment.current.viewState;
    return (state["tree-1"] && state["tree-1"].focusedItem) || "Fruit";
  };

  const updateElementTitle = useGroupStore((state) => state.updateElementTitle);
  const updateGroup = useGroupStore((state) => state.updateGroup);

  return (
    <div className="relative mr-[1px]">
      <div className="m-4">
        <Button
          onClick={() => {
            const id = uuid();
            wrapper?.current?.addGroup(id);
          }}
        >
          Add section
        </Button>

        <div>
          <div>
            <UncontrolledTreeEnvironment
              ref={environment}
              onFocusItem={onFocusItem}
              onDrop={async (items: TreeItem[], target: DraggingPosition) => {
                const { parentItem } = target as DraggingPositionItem;
                const children = (await dataProvider.getTreeItem(parentItem)).children;
                updateGroup(parentItem, children);
              }}
              onRenameItem={(item, name) => {
                updateElementTitle({
                  id: Number(item.index),
                  text: name,
                });
              }}
              canDragAndDrop={true}
              canReorderItems={true}
              dataProvider={dataProvider}
              getItemTitle={(item) => item.data}
              viewState={viewState}
            >
              <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
            </UncontrolledTreeEnvironment>
          </div>
        </div>
      </div>
    </div>
  );
};
