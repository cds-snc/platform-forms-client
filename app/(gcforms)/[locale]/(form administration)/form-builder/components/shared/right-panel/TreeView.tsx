import React, { useEffect } from "react";
import { Tree } from "react-arborist";
import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";
import { useDynamicTree } from "./hooks/useDynamicTree";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { useTranslation } from "react-i18next";
import { Cursor } from "./Cursor";

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const { t } = useTranslation("form-builder");

  const { lastChange } = useTemplateContext();

  const { data, setData, controllers } = useDynamicTree();

  const elementCount = elements.length;

  useEffect(() => {
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

    const treeData = [
      {
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
          ...formElements,
        ],
      },
      {
        id: "end",
        name: "End",
        icon: null,
        readOnly: true,
        children: [
          {
            id: "confirmation",
            icon: null,
            name: "Confirmation",
            readOnly: true,
          },
        ],
      },
    ];

    setData(treeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementCount, lastChange]);

  return (
    <div className="relative mr-[1px] bg-gray-soft">
      <Tree
        data={data}
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
