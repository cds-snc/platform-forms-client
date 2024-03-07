import { CursorProps, NodeApi, NodeRendererProps, Tree } from "react-arborist";

import { ComponentType } from "react";
import { useTemplateStore } from "@lib/store";
import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { cn } from "@lib/utils";
import { LockIcon } from "@serverComponents/icons";

export type FormItem = {
  id: string;
  name: string;
  icon: ComponentType | null;
  readOnly: boolean;
  children?: FormItem[];
};

function Input({ node }: { node: NodeApi<FormItem> }) {
  return (
    <input
      autoFocus
      type="text"
      defaultValue={node.data.name}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()}
      onKeyDown={(e) => {
        if (e.key === "Escape") node.reset();
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
}

function FolderArrow({ node }: { node: NodeApi<FormItem> }) {
  if (node.isLeaf) return <span></span>;
  return (
    <span>
      {node.isOpen ? (
        <ArrowDown className="ml-4 mr-2 inline-block" />
      ) : (
        <ArrowRight className="ml-4 mr-2 inline-block" />
      )}
    </span>
  );
}

function Cursor({ top, left }: CursorProps) {
  return <div className="border-b-2 bg-black" style={{ top, left }}></div>;
}

function Node({ node, style, dragHandle }: NodeRendererProps<FormItem>) {
  let className = "";

  if (node.isLeaf) {
    className = "";
  } else {
    className = cn("border-x-1 border-b-1 border-gray-soft p-2", node.isClosed && "bg-white");
  }

  return (
    <div
      ref={dragHandle}
      style={style}
      className={className}
      onClick={() => node.isInternal && node.toggle()}
    >
      {node.isLeaf ? (
        <div>
          <span>
            {node.isEditing ? (
              <Input node={node} />
            ) : (
              <div className="flex justify-between border-r-[40px] border-gray-soft bg-white p-1 pl-4">
                {node.data.name}
                {node.data.readOnly && <LockIcon className="mr-2 mt-1 inline-block scale-75" />}
              </div>
            )}
          </span>
        </div>
      ) : (
        <div>
          <FolderArrow node={node} />
          {node.data.name}
        </div>
      )}
    </div>
  );
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
