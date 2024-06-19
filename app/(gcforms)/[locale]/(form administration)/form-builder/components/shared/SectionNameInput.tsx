"use client";
import React from "react";
import { cn } from "@lib/utils";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { GroupStoreState } from "@formBuilder/components/shared/right-panel/treeview/store/types";
import { useTranslation } from "@i18n/client";

interface Props {
  value: string;
  groupId: string;
  updateGroupName: GroupStoreState["updateGroupName"];
  ref?: React.RefObject<HTMLInputElement>;
}

type Ref = HTMLInputElement;

export const SectionNameInput = React.forwardRef<Ref, Props>((props, ref) => {
  let { value } = props;
  const { updateGroupName, groupId } = props;
  const className =
    "rounded-md px-2 py-1 min-w-[250px] max-w-[400px] text-base font-bold text-ellipsis placeholder-slate-500 h-10";
  const disabled = groupId === "start" || groupId === "end" || groupId === "review";
  const { t } = useTranslation("form-builder");
  const { tree } = useTreeRef();

  // Override the value if it's a reserved name
  if (value === "Start") {
    value = t("logic.start", { ns: "form-builder" });
  }

  if (value === "End") {
    value = t("logic.end", { ns: "form-builder" });
  }

  return (
    <input
      className={cn(
        className,
        disabled && "!bg-gray-soft cursor-default",
        !disabled && "border-1 border-[#1B00C2] hover:border-1 hover:border-gray-default"
      )}
      aria-label={t("groups.sectionNameInput", { ns: "form-builder" })}
      value={value}
      placeholder={t("groups.newSection", { ns: "form-builder" })}
      onChange={(e) => {
        const val = e.target.value;
        tree?.current?.renameItem(groupId, e.target.value);
        updateGroupName({ id: groupId, name: val });
      }}
      disabled={disabled}
      ref={ref}
      autoComplete="off"
    />
  );
});

SectionNameInput.displayName = "SectionNameInput";
