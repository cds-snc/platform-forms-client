import React, { useEffect } from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { end } from "./data";
import { FormItem } from "./types";
import { v4 as uuid } from "uuid";

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const { t } = useTranslation("form-builder");

  const { groups, addGroup, controllers } = useDynamicTree();

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

  useEffect(() => {
    //
  }, [addGroup, groups.length]);

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            addGroup(uuid());
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
