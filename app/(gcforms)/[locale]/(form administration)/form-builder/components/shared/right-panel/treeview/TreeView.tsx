import React, { useCallback, useEffect } from "react";
import { Tree } from "react-arborist";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { Cursor } from "./Cursor";
import { Button } from "@clientComponents/globals";
import { start, end, createItem } from "./data";
import { TreeData } from "./types";

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const { t } = useTranslation("form-builder");

  const { lastChange } = useTemplateContext();

  const { data, setData, controllers } = useDynamicTree();

  const elementCount = elements.length;

  const addItem = useCallback(
    (itemName?: string): TreeData => {
      /*
    const formElements = elements.map((element) => {
      return {
        id: String(element.id),
        name: element.properties.titleEn
          ? element.properties.titleEn
          : t(`addElementDialog.${element.type}.title`),
        icon: null,
        readOnly: false,
      };
    });
    */

      let newData: TreeData = [];

      if (data.length >= 3) {
        // Remove the "start" and the "end" sections from data
        newData = data.slice(1, data.length - 1);
      }

      if (itemName) {
        const newItem = createItem(itemName);
        return [start, ...newData, newItem, end];
      }

      return data;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [data]
  );

  useEffect(() => {
    // @ todo re-add this but we need to add elements to each group
    // setData(treeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementCount, lastChange]);

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            const treeData = addItem("New Section");
            setData(treeData);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>
      </div>
      <Tree
        data={data.length < 1 ? [start, end] : data}
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
