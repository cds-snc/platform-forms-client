import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { TreeItem } from "react-complex-tree";
import { cn } from "@lib/utils";

import { getSourceHandlePosition, getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

const OptionRuleSvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} fill="none">
      <rect width={33} height={33} x={0.5} y={0.5} fill="#ECFDF5" rx={16.5} />
      <rect width={33} height={33} x={0.5} y={0.5} stroke="#047857" rx={16.5} />
      <path
        fill="#1E293B"
        d="M10 10v9c0 .55.196 1.02.588 1.413.391.391.862.587 1.412.587h8.2l-1.6 1.6L20 24l4-4-4-4-1.4 1.4 1.6 1.6H12v-9h-2Z"
      />
    </svg>
  );
};

const QuestionRuleSvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} fill="none">
      <rect width={35} height={35} x={0.5} y={0.5} fill="#EDE9FE" rx={17.5} />
      <rect width={35} height={35} x={0.5} y={0.5} stroke="#4338CA" rx={17.5} />
      <path fill="#020617" d="M22.175 19H10v-2h12.175l-5.6-5.6L18 10l8 8-8 8-1.425-1.4 5.6-5.6Z" />
    </svg>
  );
};

export const GroupNode = (node: NodeProps) => {
  const direction = layoutOptions.direction;
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const selectedElementId = useGroupStore((state) => state.selectedElementId);
  const selectedGroupId = useGroupStore((state) => state.id);
  const getElement = useGroupStore((state) => state.getElement);
  const groupIsSelected = selectedGroupId === node.id;
  const typesWithOptions = ["radio", "checkbox", "select", "dropdown"];

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
    "relative flex w-[100%] min-w-[200px] max-w-[250px] rounded-sm bg-slate-50 p-4 text-sm text-slate-600 pr-12";

  return (
    <div>
      <div>
        <label htmlFor={node.id} className="inline-block w-5/6 truncate text-sm text-slate-600">
          {node.data.label}
        </label>
      </div>
      <div
        id={node.id}
        className={cn(
          "space-y-2 rounded-md border-1 border-indigo-500 p-4 text-white",
          groupIsSelected ? "bg-violet-200 border-2" : "bg-gray-soft",
          "relative"
        )}
      >
        {node.id !== "end" && (
          <div
            {...handleClick}
            className="absolute right-[-20px] top-[-20px] cursor-pointer hover:scale-125"
          >
            <QuestionRuleSvg />
          </div>
        )}
        {!node.data.children.length && <div className="min-h-[50px] min-w-[150px]">d</div>}
        {node.data.children.map((child: TreeItem) => {
          const selected =
            selectedElementId === Number(child.index)
              ? "border-violet-800 border-2 border-dashed"
              : "border-violet-200 border-2 border-solid";

          const item = getElement(Number(child.index));

          if (!item) {
            // Check for "start" and "end" nodes "no elements"
            // see: useFlowData.tsx
            if (
              child.index === "introduction" ||
              child.index === "privacy" ||
              child.index === "confirmation" ||
              child.index === "review"
            ) {
              return (
                <div key={child.index} className={cn(nodeClassName)}>
                  {child.data}
                </div>
              );
            }
          }

          if (!item) {
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
                setId(node.id);
                setSelectedElementId(Number(child.index));
              }}
              className={cn(nodeClassName, selected)}
            >
              {child.data}
              <div className="absolute right-[10px] top-[10px] cursor-pointer hover:scale-125">
                <OptionRuleSvg />
              </div>
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
