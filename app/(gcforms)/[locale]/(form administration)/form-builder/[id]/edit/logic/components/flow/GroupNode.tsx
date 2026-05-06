import { Handle, NodeProps } from "@xyflow/react";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
import { useTranslation } from "@i18n/client";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { cn } from "@lib/utils";

import { layoutOptions } from "./options";
import { getSourceHandlePosition, getTargetHandlePosition } from "./utils";

type GroupNodeData = {
  label: {
    name: string;
  };
};

const PageSvg = ({ title }: { title?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} viewBox="0 0 36 36" fill="none">
      {title && <title>{title}</title>}
      <rect width={35} height={35} x={0.5} y={0.5} fill="#EDE9FE" rx={17.5} />
      <rect width={35} height={35} x={0.5} y={0.5} stroke="#4338CA" rx={17.5} />
      <path fill="#020617" d="M22.175 19H10v-2h12.175l-5.6-5.6L18 10l8 8-8 8-1.425-1.4 5.6-5.6Z" />
    </svg>
  );
};

export const GroupNode = ({ id, data }: NodeProps) => {
  const nodeData = data as GroupNodeData;
  const direction = layoutOptions.direction;
  const isStartNode = id === "start";
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const selectedGroupId = useGroupStore((state) => state.id);
  const groupIsSelected = selectedGroupId === id;
  const { t } = useTranslation("form-builder");
  const { togglePanel } = useTreeRef();

  const handleClick = () => {
    setId(id);
    setSelectedElementId(0);
    togglePanel?.(true);
  };

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-x-visible rounded-xl border-2 bg-slate-50/95 transition-colors",
        "overflow-y-visible",
        groupIsSelected
          ? "shadow-logicSelected border-indigo-600 bg-violet-100"
          : "shadow-logicDefault border-indigo-400"
      )}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate text-base font-semibold text-slate-700">
            {nodeData.label.name}
          </div>
          <button
            onClick={handleClick}
            className="shrink-0 self-center rounded-full outline-offset-4 outline-slate-800 transition-transform hover:scale-110 [&_svg]:block"
          >
            <PageSvg title={t("groups.editPage", { name: nodeData.label.name })} />
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={getSourceHandlePosition(direction)}
        isConnectable={false}
        className="h-3! w-3! border-2! border-indigo-700! bg-white!"
      />
      {!isStartNode ? (
        <Handle
          type="target"
          position={getTargetHandlePosition(direction)}
          isConnectable={false}
          className="h-3! w-3! border-2! border-indigo-700! bg-white!"
        />
      ) : null}
    </div>
  );
};
