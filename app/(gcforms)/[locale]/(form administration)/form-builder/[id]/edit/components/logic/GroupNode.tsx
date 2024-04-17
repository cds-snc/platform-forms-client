import { Handle, Position } from "reactflow";
import { NodeProps } from "reactflow";
import { TreeItem } from "react-complex-tree";

export const GroupNode = (node: NodeProps) => {
  return (
    <div>
      <div>
        <label htmlFor={node.id} className="text-sm text-slate-600">
          {node.data.label}
        </label>
      </div>

      <div
        id={node.id}
        className="rounded-md border-1 border-violet-800 bg-gray-200 p-4 text-white"
      >
        {node.data.children.map((child: TreeItem) => {
          return (
            <div
              key={child.index}
              className="mb-2 flex w-[100%] min-w-[200px] rounded-sm bg-white p-1 text-sm text-slate-600"
            >
              {child.data}
            </div>
          );
        })}

        {node.data.id !== "start" && (
          <Handle type="target" position={Position.Left} isConnectable={false} />
        )}
        {node.data.id !== "end" && (
          <Handle type="source" position={Position.Right} isConnectable={false} />
        )}
      </div>
    </div>
  );
};

export default GroupNode;
