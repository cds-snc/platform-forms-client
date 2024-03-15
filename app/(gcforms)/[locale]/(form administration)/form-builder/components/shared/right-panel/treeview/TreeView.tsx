import React from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

// import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { start, end } from "./data";
import { v4 as uuid } from "uuid";
import { NodeApi } from "react-arborist";
import { TreeItem } from "./types";
import { useGroupStore } from "./store";
import { useTreeRef } from "./provider/TreeRefProvider";

export const TreeView = () => {
  const treeRef = useTreeRef();

  const { t } = useTranslation("form-builder");

  // @todo maybe use templateIsDirty or lastChange to trigger a render
  // const { templateIsDirty, lastChange } = useContext(TemplateApiContext);
  // when updating a question title and we need to reflect the change in the tree

  const { groups, addGroup, controllers } = useDynamicTree();
  const [lastNodeAdded, setLastNodeAdded] = React.useState<string | null>(null);
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
            addGroup(id, "New Section");
            const rId = `${id}-${new Date().getTime().toString()}`;
            setLastNodeAdded(rId);
            setId(id);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>
      </div>
      <div data-last-element={lastNodeAdded}>
        <Tree
          openByDefault={false}
          ref={treeRef}
          data={[start, ...groups, end]}
          {...controllers}
          onRename={(data) => {
            controllers.onRename(data);
            const rId = `${data.id}-${new Date().getTime().toString()}`;
            setLastNodeAdded(rId);
          }}
          disableEdit={(data) => data.readOnly}
          renderCursor={Cursor}
          indent={40}
          rowHeight={46}
          width="100%"
          disableDrop={({ parentNode }: { parentNode: NodeApi<TreeItem> }) => {
            if (parentNode.data.id === "end") {
              return true;
            }
            return false;
          }}
          disableDrag={(data) => data.readOnly}
        >
          {Node}
        </Tree>
      </div>
    </div>
  );
};
