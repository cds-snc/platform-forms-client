import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { TreeItem } from "react-complex-tree";

import { getSourceHandlePosition, getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const GroupNode = (node: NodeProps) => {
  const direction = layoutOptions.direction;
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  return (
    <div>
      <div>
        <label htmlFor={node.id} className="inline-block text-sm text-slate-600">
          {node.data.label}
        </label>
      </div>
      <div
        id={node.id}
        className="space-y-2 rounded-md border-1 border-violet-800 bg-gray-200 p-4 text-white"
        onClick={() => setId(node.id)}
      >
        {node.data.children.map((child: TreeItem) => {
          return (
            <div
              key={child.index}
              onClick={() => setSelectedElementId(Number(child.index))}
              className="flex w-[100%] min-w-[200px] max-w-[250px] rounded-sm bg-white p-1 text-sm text-slate-600"
            >
              {child.data}
            </div>
          );
        })}

        {node.id !== "end" && (
          <Handle
            type="source"
            position={getSourceHandlePosition(direction)}
            isConnectable={false}
          />
        )}

        {node.id !== "start" && (
          <Handle
            type="target"
            position={getTargetHandlePosition(direction)}
            isConnectable={false}
          />
        )}
      </div>
    </div>
  );
};

export default GroupNode;
