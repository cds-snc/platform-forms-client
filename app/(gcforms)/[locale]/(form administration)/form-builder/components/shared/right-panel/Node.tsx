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
      {node.isLeaf ? (
        <div>
          <span>
            {node.isEditing ? (
              <Input node={node} />
            ) : (
              <div className="flex justify-between border-r-[40px] border-gray-soft bg-white p-1 pl-4">
                {node.data.name}
                {!node.data.readOnly && <DragHandle className="mt-[7px]" />}
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
};
