import React, { useState, ReactNode } from "react";
import { useTreeRef } from "./provider/TreeRefProvider";
import { useTranslation } from "@i18n/client";
import { TreeItemIndex, TreeItemRenderContext } from "react-complex-tree";

export const EditableInput = ({
  title,
  context,
}: {
  title: ReactNode;
  context: TreeItemRenderContext;
}) => {
  const { tree } = useTreeRef();
  const { t } = useTranslation("form-builder");

  const itemName = React.isValidElement(title) && title.props.title;
  const [name, setName] = useState(itemName);
  return (
    <input
      {...context.interactiveElementProps}
      type="text"
      placeholder={t("groups.addSectionPlaceholder")}
      autoFocus
      className="ml-10 w-auto p-1"
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
