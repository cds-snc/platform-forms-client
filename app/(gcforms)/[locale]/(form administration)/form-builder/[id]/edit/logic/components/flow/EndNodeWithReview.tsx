import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { useTranslation } from "@i18n/client";
import { getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const EndNodeWithReview = (node: NodeProps) => {
  const { t } = useTranslation("form-builder");
  const direction = layoutOptions.direction;
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const { togglePanel } = useTreeRef();

  const nodeClassName =
    "relative flex w-[100%] min-w-[200px] max-w-[200px] rounded-sm bg-slate-50 p-2 py-3 text-sm text-slate-600 border-red";

  return (
    <div className="mt-10">
      <div>
        <label
          htmlFor={node.id}
          className="inline-block w-5/6 max-w-[200px] truncate text-sm text-slate-600"
        >
          {t("logic.endNodeWithReview.label")}
        </label>
      </div>
      <div
        id={node.id}
        className="cursor-pointer"
        onClick={() => {
          setId(node.id);
          // Reset selected element id
          setSelectedElementId(0);
          togglePanel && togglePanel(true);
        }}
      >
        {/* Review  */}
        <div className="relative mb-1 space-y-2 rounded-md border-1 border-red-hover bg-[#FEF2F2] p-4 text-white shadow-offboardDefault">
          <div className={nodeClassName}>
            <div className="truncate">{t("logic.endNodeWithReview.reviewContent")}</div>
          </div>
          <Handle
            type="target"
            position={getTargetHandlePosition(direction)}
            isConnectable={false}
          />
        </div>
        {/* End  */}
        <div className="relative mb-4 space-y-2 rounded-md border-1 border-red-hover bg-[#FEF2F2] p-4 text-white shadow-offboardDefault">
          <div className={nodeClassName}>
            <div className="truncate">{t("logic.endNode.confirmContent")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndNodeWithReview;
