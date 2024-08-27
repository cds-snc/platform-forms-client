import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { useTranslation } from "@i18n/client";
import { getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";

export const EndNode = (node: NodeProps) => {
  const direction = layoutOptions.direction;
  const { t } = useTranslation("form-builder");

  const nodeClassName =
    "relative flex w-[100%] min-w-[200px] max-w-[200px] rounded-sm bg-slate-50 p-2 py-3 text-sm text-slate-600 border-red";

  return (
    <div className="mt-10">
      <div>
        <label
          htmlFor={node.id}
          className="inline-block w-5/6 max-w-[200px] truncate text-sm text-slate-600"
        >
          {t("logic.endNode.label")}
        </label>
      </div>
      <div id={node.id}>
        {/* End  */}
        <div className="relative mb-4 space-y-2 rounded-md border-1 border-red-hover bg-[#FEF2F2] p-4 text-white shadow-offboardDefault">
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
