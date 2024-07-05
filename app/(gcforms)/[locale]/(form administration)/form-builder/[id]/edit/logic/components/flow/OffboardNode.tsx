import { Handle } from "reactflow";
import { NodeProps } from "reactflow";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { getTargetHandlePosition } from "./utils";
import { layoutOptions } from "./options";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

const ExitSvg = ({ title }: { title?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} fill="none">
      {title && <title>{title}</title>}
      <path
        d="M36 18.5C36 8.83502 28.165 1 18.5 1C8.83502 1 1 8.83502 1 18.5C1 28.165 8.83502 36 18.5 36C28.165 36 36 28.165 36 18.5Z"
        fill="#FEF2F2"
      />
      <path
        d="M12 28C11.45 28 10.9792 27.8042 10.5875 27.4125C10.1958 27.0208 10 26.55 10 26V22H12V26H26V12H12V16H10V12C10 11.45 10.1958 10.9792 10.5875 10.5875C10.9792 10.1958 11.45 10 12 10H26C26.55 10 27.0208 10.1958 27.4125 10.5875C27.8042 10.9792 28 11.45 28 12V26C28 26.55 27.8042 27.0208 27.4125 27.4125C27.0208 27.8042 26.55 28 26 28H12ZM17.5 24L16.1 22.55L18.65 20H10V18H18.65L16.1 15.45L17.5 14L22.5 19L17.5 24Z"
        fill="#1E293B"
      />
      <path
        d="M36 18.5C36 8.83502 28.165 1 18.5 1C8.83502 1 1 8.83502 1 18.5C1 28.165 8.83502 36 18.5 36C28.165 36 36 28.165 36 18.5Z"
        stroke="#B91C1C"
      />
    </svg>
  );
};

export const OffboardNode = (node: NodeProps) => {
  const direction = layoutOptions.direction;
  const { t } = useTranslation("form-builder");

  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const nodeClassName =
    "relative flex w-[100%] min-w-[200px] max-w-[200px] rounded-sm bg-slate-50 p-2 py-3 text-sm text-slate-600 border-red";

  const selectedGroupId = useGroupStore((state) => state.id);

  const groupIsSelected = selectedGroupId === node.id;

  const handleClick = {
    onClick: () => {
      setId(node.id);
      // Reset selected element id
      setSelectedElementId(0);
    },
  };

  return (
    <div>
      <div>
        <label
          htmlFor={node.id}
          className="inline-block w-5/6 max-w-[200px] truncate text-sm text-slate-600"
        >
          {/* Case of Review and End (no name) hide visually but include text required for a label */}
          {node.data.label || <span className="sr-only">{node.id}</span>}
        </label>
      </div>
      <div
        id={node.id}
        className={cn(
          "space-y-2 rounded-md border-1 border-slate-800 p-4 text-white",
          groupIsSelected
            ? "bg-[#FEF2F2] shadow-offboardSelected"
            : "bg-[#FEF2F2] shadow-offboardDefault",
          !groupIsSelected && "focus-within:bg-violet-100 focus-within:border-dashed",
          "relative "
        )}
      >
        <button
          {...handleClick}
          className={cn(
            "absolute right-[-20px] top-[-20px] cursor-pointer outline-offset-8 outline-slate-800 hover:scale-125 rounded-full"
          )}
        >
          <ExitSvg title={t("logic.exit.nodeIconLabel")} />
        </button>

        {/* Elements */}
        <div className={cn(nodeClassName)}>
          <div className="truncate">{t("logic.exit.offboardNodeContent.content")}</div>
        </div>

        <div className={cn(nodeClassName)}>
          <div className="truncate">{t("logic.exit.offboardNodeContent.exitButton")}</div>
        </div>

        <Handle type="target" position={getTargetHandlePosition(direction)} isConnectable={false} />
      </div>
    </div>
  );
};

export default OffboardNode;
