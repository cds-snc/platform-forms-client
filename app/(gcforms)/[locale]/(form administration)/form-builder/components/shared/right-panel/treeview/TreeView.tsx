import React, { useEffect } from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { start, end } from "./data";
import { v4 as uuid } from "uuid";

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const { t } = useTranslation("form-builder");

  const { groups, addGroup, setGroups, controllers } = useDynamicTree();

  useEffect(() => {
    // If there are no groups create them
    if (groups.length < 1) {
      const startGroup = {
        id: uuid(),
        name: "New Section",
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
  }, [addGroup, setGroups, elements, groups]);

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            addGroup(uuid(), "New Section");
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>
      </div>
      <Tree
        data={[start, ...groups, end]}
        {...controllers}
        disableEdit={(data) => data.readOnly}
        renderCursor={Cursor}
        indent={40}
        rowHeight={46}
        width="100%"
        disableDrop={({ parentNode }) => {
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
  );
};
