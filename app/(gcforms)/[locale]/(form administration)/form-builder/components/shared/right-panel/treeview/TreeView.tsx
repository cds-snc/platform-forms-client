import React, { useCallback } from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { start, end, createItem } from "./data";
import { TreeData, FormItem } from "./types";

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const { t } = useTranslation("form-builder");

  const { groups, setGroups, controllers } = useDynamicTree();

  const addItem = useCallback(
    (itemName?: string): TreeData => {
      let newData: TreeData = [];

      if (groups.length >= 3) {
        // Remove the "start" and the "end" sections from data
        newData = groups.slice(1, groups.length - 1);
      }

      if (itemName) {
        const newItem = createItem(itemName);
        return [start, ...newData, newItem, end];
      }

      return groups;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [groups]
  );

  let startGroup = {} as FormItem;
  if (groups.length < 1) {
    startGroup = {
      id: "start",
      name: "Start",
      icon: null,
      readOnly: true,
      children: [
        {
          id: "introduction",
          name: "Introduction",
          icon: null,
          readOnly: true,
        },
        ...elements.map((element) => {
          return {
            id: String(element.id),
            name: "",
            icon: null,
            readOnly: false,
          };
        }),
      ],
    };
  }

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            const treeData = addItem("New Section");
            setGroups(treeData);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>
      </div>
      <Tree
        data={groups.length < 1 ? [startGroup, end] : groups}
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
