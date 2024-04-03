import React from "react";
import { Button } from "@clientComponents/globals";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  TreeItem,
  IndividualTreeViewState
} from "react-complex-tree";
import "react-complex-tree/lib/style-modern.css";
import { useTreeRef } from "./provider/TreeRefProvider";

export const TreeView = ({
  dataProvider,
  viewState,
  onFocusItem,
}: {
  dataProvider: StaticTreeDataProvider;
  viewState: IndividualTreeViewState;
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
              onDrop={(items, target) => {
                console.log(items, target);
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
