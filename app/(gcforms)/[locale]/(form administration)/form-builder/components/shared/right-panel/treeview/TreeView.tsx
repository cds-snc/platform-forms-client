import React, { useEffect, useRef } from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

// import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { start, end } from "./data";
import { v4 as uuid } from "uuid";
import { TreeApi, NodeApi } from "react-arborist";
import { TreeItem } from "./types";
import { useGroupStore } from "./store";

export const TreeView = () => {
  /*
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));
  */

  const treeRef = useRef<TreeApi<TreeItem>>();

  const { t } = useTranslation("form-builder");

  const { groups, addGroup, controllers } = useDynamicTree();
  const [lastNodeAdded, setLastNodeAdded] = React.useState<string | null>(null);
  const { id, setId } = useGroupStore((s) => {
    return { id: s.id, setId: s.setId };
  });

  // @todo setup default groups
  /*
  useEffect(() => {
    if (groups.length < 1) {
      const startGroup = {
        id: uuid(),
        name: "Default Section",
        readOnly: true,
        icon: null,
        children: [
          ...elements.map((element) => {
            return {
              id: String(element.id),
              name: "default",
              icon: null,
              readOnly: false,
            };
          }),
        ],
      };
      setGroups([startGroup]);
    }
  }, [setGroups, elements, groups]);
  */

  useEffect(() => {
    // Update the tree selection when the id changes
    const tree = treeRef.current;
    tree?.setSelection({ ids: [id], anchor: id, mostRecent: id });
  }, [id]);

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            const id = uuid();
            addGroup(id, "New Section");
            setLastNodeAdded(id);
            setId(id);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>
      </div>
      <div data-last-element={lastNodeAdded}>
        <Tree
          ref={treeRef}
          data={[start, ...groups, end]}
          {...controllers}
          onRename={(data) => {
            controllers.onRename(data);
            setLastNodeAdded(data.id);
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
