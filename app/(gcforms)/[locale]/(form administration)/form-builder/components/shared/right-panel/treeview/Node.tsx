import React from "react";
import { NodeApi, NodeRendererProps } from "react-arborist";
import { cn } from "@lib/utils";
import { TreeItem } from "./types";
import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { DragHandle } from "./icons/DragHandle";
import { LockIcon } from "@serverComponents/icons";
import { useGroupStore } from "./store";
import { FormElement } from "@lib/types";
import { LocalizedFormProperties, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store";

function Input({ node }: { node: NodeApi<TreeItem> }) {
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

function FolderArrow({ node }: { node: NodeApi<TreeItem> }) {
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

export const ParentNode = ({ node }: { node: NodeApi<TreeItem> }) => {
  const active = node.isSelected;
  // const childActive = node.children?.some((child) => child.isSelected);
  return (
    <div className={cn(active && "font-bold")}>
      {node.isEditing ? (
        <div>
          <FolderArrow node={node} />
          <Input node={node} />
        </div>
      ) : (
        <div>
          <FolderArrow node={node} />
          {node.data.name}
        </div>
      )}
    </div>
  );
};

export const ChildNode = ({
  node,
  element,
}: {
  node: NodeApi<TreeItem>;
  element: FormElement | undefined;
}) => {
  const active = node.isSelected;
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const language = translationLanguagePriority;
  const titleKey = localizeField(LocalizedFormProperties.TITLE, language);
  const descKey = localizeField(LocalizedElementProperties.DESCRIPTION, language);

  let label = "";
  if (element && element.properties[titleKey]) {
    label = element.properties[titleKey] || "";
  }

  if (label === "" && element && element.properties[descKey]) {
    label = element.properties[descKey] || "";
  }

  if (label === "") {
    label = node.data.name || "Untitled";
  }

  return (
    <div className={cn("border-x-1 border-b-1 border-gray-soft p-2", active && "font-bold")}>
      {node.isEditing ? (
        <Input node={node} />
      ) : (
        <div className="group relative w-[350px] overflow-hidden truncate border-gray-soft bg-white p-1 pr-10">
          {label}
          {!node.data.readOnly && (
            <DragHandle className="absolute right-0 top-0 mr-4 mt-3 hidden cursor-pointer group-hover:block" />
          )}
          {node.data.readOnly && (
            <LockIcon className="absolute right-0 mr-2 inline-block scale-75" />
          )}
        </div>
      )}
    </div>
  );
};

export const Node = ({ node, style, dragHandle }: NodeRendererProps<TreeItem>) => {
  const setId = useGroupStore((s) => s.setId);
  const getElement = useGroupStore((s) => s.getElement);
  const element = getElement(Number(node.data.id));

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
      onClick={() => {
        setTimeout(() => {
          if (!node.isEditing) node.toggle();
        }, 200); // Delay of 200ms to allow for double click to be detected

        setId(node.data.id);
      }}
      onDoubleClick={() => {
        if (node.data.readOnly) {
          return;
        }
        node.edit();
      }}
    >
      {node.isLeaf ? <ChildNode node={node} element={element} /> : <ParentNode node={node} />}
    </div>
  );
};
