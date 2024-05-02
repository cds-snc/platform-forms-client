import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { TreeItem } from "react-complex-tree";
import { cn } from "@lib/utils";

import { getSourceHandlePosition, getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const GroupNode = (node: NodeProps) => {
  const direction = layoutOptions.direction;
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const selectedElementId = useGroupStore((state) => state.selectedElementId);
  const selectedGroupId = useGroupStore((state) => state.id);
  const getElement = useGroupStore((state) => state.getElement);
  const groupIsSelected = selectedGroupId === node.id;
  const typesWithOptions = ["radio", "checkbox", "select"];

  const handleClick =
    node.id === "end"
      ? {
          onClick: () => {
            setId("end");
            // Reset selected element id
            setSelectedElementId(0);
          },
        }
      : {
          onClick: () => {
            setId(node.id);
            // Reset selected element id
            setSelectedElementId(0);
          },
        };

  const nodeClassName =
    "flex w-[100%] min-w-[200px] max-w-[250px] rounded-sm bg-slate-50 p-1 text-sm text-slate-600";

  return (
    <div>
      <div>
        <label htmlFor={node.id} className="inline-block text-sm text-slate-600">
          {node.data.label}
        </label>
      </div>
      <div
        id={node.id}
        className={cn(
          "space-y-2 rounded-md border-1 border-indigo-500 p-4 text-white",
          groupIsSelected ? "bg-violet-300" : "bg-gray-soft",
          "cursor-pointer hover:bg-violet-300"
        )}
        {...handleClick}
      >
        {node.data.children.map((child: TreeItem) => {
          const selected =
            selectedElementId === Number(child.index)
              ? "border-violet-800 border-1 border-dashed"
              : "border-transparent";

          const item = getElement(Number(child.index));

          if (!item) {
            // Check for "start" and "end" nodes "no elements"
            // see: useFlowData.tsx
            if (
              child.index === "introduction" ||
              child.index === "privacy" ||
              child.index === "confirmation"
            ) {
              return (
                <div key={child.index} className={cn(nodeClassName)}>
                  {child.data}
                </div>
              );
            }
            return null;
          }

          // Render "non-option" elements
          // No click event as we can't select these
          if (!typesWithOptions.includes(item.type)) {
            return (
              <div key={child.index} className={cn(nodeClassName)}>
                {child.data}
              </div>
            );
          }

          // Render "option" elements
          // This will allow the user to select the next action
          // based on the option value
          return (
            <div
              key={child.index}
              onClick={(evt) => {
                evt.stopPropagation();
                setSelectedElementId(Number(child.index));
              }}
              className={cn(nodeClassName, selected)}
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
        <Handle type="target" position={getTargetHandlePosition(direction)} isConnectable={false} />
      </div>
    </div>
  );
};

export default GroupNode;
