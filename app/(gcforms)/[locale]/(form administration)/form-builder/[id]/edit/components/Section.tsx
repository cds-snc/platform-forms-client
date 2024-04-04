import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useState } from "react";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const Section = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation("form-builder");

  const { groups } = useTemplateStore((s) => ({
    groups: s.form.groups,
  }));

  const { wrapper } = useTreeRef();
  const { handleAddElement } = useHandleAdd(wrapper?.current);
  const updateGroupName = useGroupStore((state) => state.updateGroupName);
  const [editing, setEditing] = useState(false);

  const groupName = groups?.[groupId]?.name;

  if (groupId === "start" || groupId === "end") {
    return null;
  }

  const handleOnBlur = (e: React.FocusEvent) => {
    saveGroupName(e.currentTarget.textContent || "");
  };

  const handleOnKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveGroupName(e.currentTarget.textContent || "");
    }
  };

  const saveGroupName = (groupName: string) => {
    updateGroupName({ id: groupId, name: groupName });
    setEditing(false);
    wrapper?.current?.updateItem(groupId, groupName);
  };

  return (
    <>
      <div className="mb-10 flex max-w-[800px] justify-center">
        <AddElementButton
          handleAdd={(type?: FormElementTypes) => {
            handleAddElement(-1, type);
          }}
          text={t("addElement")}
        />
      </div>
      <div className="flex max-w-[800px] justify-center rounded-t-lg border-1 border-slate-700 p-2">
        <h4
          onDoubleClick={() => setEditing(true)}
          contentEditable={editing}
          onBlur={handleOnBlur}
          onKeyUp={handleOnKeyUp}
        >
          {groupName}
        </h4>
      </div>
    </>
  );
};
