import { CursorProps, Tree } from "react-arborist";

import { useTemplateStore } from "@lib/store";
import { Node } from "./Node";

function Cursor({ top, left }: CursorProps) {
  return <div className="border-b-2 bg-black" style={{ top, left }}></div>;
}

export const TreeView = () => {
  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const formElements = elements.map((element) => {
    return {
      id: String(element.id),
      name: element.properties.titleEn,
      icon: null,
      readOnly: false,
    };
  });

  const data = [
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

  return (
    <div className="mr-[1px] bg-gray-soft">
      <Tree
        initialData={data}
        disableEdit={(data) => data.readOnly}
        renderCursor={Cursor}
        indent={40}
        rowHeight={46}
        width="100%"
        disableDrag={(data) => data.readOnly}
      >
        {Node}
      </Tree>
    </div>
  );
};
