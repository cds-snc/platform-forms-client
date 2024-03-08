import { NodeApi, NodeRendererProps } from "react-arborist";

import { cn } from "@lib/utils";
import { FormItem } from "./types";
import { ArrowDown } from "./icons/ArrowDown";
import { ArrowRight } from "./icons/ArrowRight";
import { DragHandle } from "./icons/DragHandle";
import { LockIcon } from "@serverComponents/icons";

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

export const ParentNode = ({ node }: { node: NodeApi<FormItem> }) => {
  return (
    <div>
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

export const ChildNode = ({ node }: { node: NodeApi<FormItem> }) => {
  return (
    <div
      onDoubleClick={() => {
        alert("double click event on node");
      }}
      className="border-x-1 border-b-1 border-gray-soft p-2"
    >
      {node.isEditing ? (
        <Input node={node} />
      ) : (
        <div className="group relative w-[350px] overflow-hidden truncate border-gray-soft bg-white p-1 pr-10">
          {node.data.name}
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

export const Node = ({ node, style, dragHandle }: NodeRendererProps<FormItem>) => {
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
      {node.isLeaf ? <ChildNode node={node} /> : <ParentNode node={node} />}
    </div>
  );
};
