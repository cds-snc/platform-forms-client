import React from "react";
import { Button } from "@clientComponents/globals";
import {
  UncontrolledTreeEnvironment,
  Tree,
  TreeItem,
  IndividualTreeViewState,
  DraggingPosition,
  DraggingPositionItem,
  TreeDataProvider,
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useGroupStore } from "./store/useGroupStore";
import { v4 as uuid } from "uuid";
import { CustomStaticTreeDataProvider } from "./provider/CustomDataProvider";

export const TreeView = ({
  dataProvider,
  viewState,
  onFocusItem,
}: {
  dataProvider: CustomStaticTreeDataProvider;
  viewState: IndividualTreeViewState;
  onFocusItem: (item: TreeItem) => void;
}) => {
  const { environment, tree, wrapper } = useTreeRef();

  // This is only for testing purposes
  // const getFocus = () => {
  //   if (!environment || !environment.current) return "Fruit";
  //   const state = environment.current.viewState;
  //   return (state["tree-1"] && state["tree-1"].focusedItem) || "Fruit";
  // };

  const updateElementTitle = useGroupStore((state) => state.updateElementTitle);
  const updateGroupName = useGroupStore((state) => state.updateGroupName);
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
                // Rename the group
                item.isFolder && updateGroupName({ id: String(item.index), name });

                // Rename the element
                !item.isFolder &&
                  updateElementTitle({
                    id: Number(item.index),
                    text: name,
                  });
              }}
              canDragAndDrop={true}
              canReorderItems={true}
              dataProvider={dataProvider as unknown as TreeDataProvider}
              getItemTitle={(item) => item.data || "New item"}
              viewState={viewState}
              disableMultiselect={true}
            >
              <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
            </UncontrolledTreeEnvironment>
          </div>
        </div>
      </div>
    </div>
  );
};
