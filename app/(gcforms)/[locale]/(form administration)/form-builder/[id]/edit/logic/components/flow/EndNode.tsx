import { Handle } from "@xyflow/react";
import { NodeProps } from "@xyflow/react";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";

export const EndNode = (node: NodeProps) => {
  const { t } = useTranslation("form-builder");
  const direction = layoutOptions.direction;
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const selectedGroupId = useGroupStore((state) => state.id);
  const { togglePanel } = useTreeRef();
  const groupIsSelected = selectedGroupId === node.id;

  const nodeClassName =
    "relative flex w-full min-w-0 rounded-sm bg-slate-50 p-2 py-3 text-sm text-slate-600 border-red";

  return (
    <div className="mt-10 w-full">
      <div>
        <label htmlFor={node.id} className="inline-block w-full text-sm text-slate-600">
          {t("logic.endNode.label")}
        </label>
      </div>
      <div
        id={node.id}
        className="w-full cursor-pointer"
        onClick={() => {
          setId(node.id);
          // Reset selected element id
          setSelectedElementId(0);
          togglePanel && togglePanel(true);
        }}
      >
        {/* End  */}
        <div
          className={cn(
            "relative mb-4 w-full space-y-2 rounded-md border-1 bg-[#FEF2F2] p-4 text-white",
            groupIsSelected ? "border-red-hover shadow-offboardSelected" : "shadow-offboardDefault"
          )}
        >
          <div className={nodeClassName}>
            <div className="truncate">{t("logic.endNode.confirmContent")}</div>
          </div>
          <Handle
            type="target"
            position={getTargetHandlePosition(direction)}
            isConnectable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EndNode;
