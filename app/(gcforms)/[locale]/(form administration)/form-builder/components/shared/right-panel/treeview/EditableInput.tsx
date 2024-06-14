import React, { useState } from "react";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useTranslation } from "@i18n/client";
import { TreeItemIndex, TreeItemRenderContext } from "react-complex-tree";

export const EditableInput = ({
  title,
  context,
  isSection,
}: {
  title: string;
  context: TreeItemRenderContext;
  isSection: boolean;
}) => {
  const { tree } = useTreeRef();
  const { t } = useTranslation("form-builder");

  const [name, setName] = useState(title);
  return (
    <input
      {...context.interactiveElementProps}
      type="text"
      placeholder={isSection ? t("groups.addSectionPlaceholder") : ""}
      autoFocus
      className="ml-12 w-5/6 rounded-md border-2 border-slate-950 p-2"
      value={name}
      onFocus={(e) => {
        e.target.select();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const props = context.interactiveElementProps as unknown as Record<string, unknown>;
          const id = props["data-rct-item-id"] as unknown as TreeItemIndex;
          tree?.current?.renameItem(id, name);
          context.stopRenamingItem();
        }
        if (e.key === "Escape" || e.key === "Tab") {
          context.stopRenamingItem();
        }
      }}
      onBlur={() => {
        context.stopRenamingItem();
      }}
      onChange={(e) => {
        setName(e.target.value);
      }}
    />
  );
};
