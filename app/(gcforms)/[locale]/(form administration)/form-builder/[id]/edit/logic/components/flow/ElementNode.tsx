import { Handle, NodeProps, Position } from "@xyflow/react";
import { cn } from "@lib/utils";

import { useGroupStore } from "@lib/groups/useGroupStore";
import { useElementTitle } from "@lib/hooks/useElementTitle";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";

interface ElementNodeData {
  groupId: string;
  elementId?: number;
  hasRules?: boolean;
  label?: string;
}

const branchableTypes: ReadonlySet<string> = new Set([
  FormElementTypes.radio,
  FormElementTypes.checkbox,
  FormElementTypes.dropdown,
]);

const OptionRuleSvg = ({ title }: { title?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 34 34" fill="none">
      {title && <title>{title}</title>}
      <rect width={33} height={33} x={0.5} y={0.5} fill="#ECFDF5" rx={16.5} />
      <rect width={33} height={33} x={0.5} y={0.5} stroke="#047857" rx={16.5} />
      <path
        fill="#1E293B"
        d="M10 10v9c0 .55.196 1.02.588 1.413.391.391.862.587 1.412.587h8.2l-1.6 1.6L20 24l4-4-4-4-1.4 1.4 1.6 1.6H12v-9h-2Z"
      />
    </svg>
  );
};

const AddRuleSvg = ({ title }: { title?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 34 34" fill="none">
      {title && <title>{title}</title>}
      <rect width={33} height={33} x={0.5} y={0.5} fill="#ECFDF5" rx={16.5} />
      <rect width={33} height={33} x={0.5} y={0.5} stroke="#047857" rx={16.5} />
      <path
        fill="#1E293B"
        d="M16 10c.552 0 1 .448 1 1v5h5c.552 0 1 .448 1 1s-.448 1-1 1h-5v5c0 .552-.448 1-1 1s-1-.448-1-1v-5h-5c-.552 0-1-.448-1-1s.448-1 1-1h5v-5c0-.552.448-1 1-1Z"
      />
    </svg>
  );
};

export const ElementNode = ({ data }: NodeProps) => {
  const nodeData = data as unknown as ElementNodeData;
  const getElement = useGroupStore((state) => state.getElement);
  const setId = useGroupStore((state) => state.setId);
  const setSelectedElementId = useGroupStore((state) => state.setSelectedElementId);
  const selectedElementId = useGroupStore((state) => state.selectedElementId);
  const selectedGroupId = useGroupStore((state) => state.id);
  const { getTitle } = useElementTitle();
  const { t } = useTranslation("form-builder");
  const { togglePanel } = useTreeRef();

  const element =
    typeof nodeData.elementId === "number" ? getElement(nodeData.elementId) : undefined;
  const isBranchable =
    !!element && branchableTypes.has(element.type) && (element.properties.choices?.length ?? 0) > 0;
  const showsRuleAffordance = isBranchable;
  const showsConnector = showsRuleAffordance && !!nodeData.hasRules;
  const isSelected =
    isBranchable &&
    selectedGroupId === nodeData.groupId &&
    selectedElementId === nodeData.elementId;

  const getDefaultLabel = () => {
    if (element?.type === FormElementTypes.richText) {
      return t("groups.treeView.emptyPageTextElement");
    }

    return t("groups.treeView.emptyFormElement");
  };

  const label =
    nodeData.label ||
    (element ? getTitle(element).substring(0, 200) : undefined) ||
    getDefaultLabel();

  return (
    <button
      onClick={(event) => {
        if (!isBranchable || !nodeData.elementId) {
          return;
        }

        event.stopPropagation();
        setId(nodeData.groupId);
        setSelectedElementId(nodeData.elementId);
        togglePanel?.(true);
      }}
      className={cn(
        "nodrag nopan group relative flex h-full w-full items-center rounded-lg border-2 bg-white text-left text-slate-700 shadow-sm transition-colors",
        "px-4 py-3 text-sm",
        isSelected ? "border-dashed border-violet-700" : "border-violet-200",
        (!nodeData.elementId || !isBranchable) && "cursor-default"
      )}
      disabled={!nodeData.elementId || !isBranchable}
    >
      <div className="min-w-0 flex-1 truncate">
        {label ? (
          <span className={cn(!nodeData.label && !element && "italic")}>{label}</span>
        ) : (
          <span className="italic">{getDefaultLabel()}</span>
        )}
      </div>

      {showsRuleAffordance && (
        <>
          <div
            className={cn(
              "shrink-0 rounded-full outline-offset-4 outline-slate-800 group-hover:scale-105",
              "ml-2"
            )}
          >
            {nodeData.hasRules ? (
              <OptionRuleSvg title={t("groups.editRules", { name: label })} />
            ) : (
              <AddRuleSvg title={t("groups.addBranch")} />
            )}
          </div>

          {showsConnector && (
            <Handle
              type="source"
              position={Position.Right}
              isConnectable={false}
              className="-right-2! h-3! w-3! border-2! border-emerald-700! bg-white!"
            />
          )}
        </>
      )}
    </button>
  );
};
