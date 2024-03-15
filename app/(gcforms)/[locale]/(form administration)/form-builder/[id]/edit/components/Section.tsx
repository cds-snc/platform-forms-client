import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useHandleAdd } from "@lib/hooks/form-builder";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const Section = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation("form-builder");

  const { groups } = useTemplateStore((s) => ({
    groups: s.form.groups,
  }));

  const { deleteGroup, setId, findParentGroup, findNextGroup, findPreviousGroup } = useGroupStore(
    (state) => {
      return {
        setId: state.setId,
        deleteGroup: state.deleteGroup,
        findParentGroup: state.findParentGroup,
        findNextGroup: state.findNextGroup,
        findPreviousGroup: state.findPreviousGroup,
      };
    }
  );

  const treeRef = useTreeRef();
  const { handleAddElement } = useHandleAdd(treeRef.current);

  const groupName = groups?.[groupId]?.name;

  if (groupId === "start" || groupId === "end") {
    return null;
  }

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
        <h4>{groupName}</h4>

        <input
          id="my-element"
          placeholder="Enter Tree Id here"
          name="my-element"
          className="ml-10 border-1"
          type="text"
        />

        <button
          className="ml-10 inline-block"
          onClick={() => {
            const id = findNextGroup(groupId)?.id || findPreviousGroup(groupId)?.id;
            deleteGroup(groupId);
            setId(id || "start");
          }}
        >
          Delete
        </button>

        <button
          className="ml-10 inline-block"
          onClick={() => {
            // get the value from my-element
            // set the value to the id
            const el = document.getElementById("my-element");
            if (el) {
              const val = (el as HTMLInputElement).value;
              // find parent group if there is one
              const parent = findParentGroup(val);
              if (parent) {
                setId(parent.id);
                return;
              }
              setId(val);
            }
          }}
        >
          Select ID
        </button>
      </div>
    </>
  );
};
