import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SectionTitle } from "./SectionTitle";

export const Section = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation("form-builder");

  const { groups } = useTemplateStore((s) => ({
    groups: s.form.groups,
  }));

  const { handleAddElement } = useHandleAdd();

  const groupName = groups?.[groupId]?.name || "";

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
      <div className="flex max-w-[800px] rounded-t-lg border-x-1 border-t-1 border-slate-700 bg-white p-2 py-5 pl-7 last:border-b-1">
        <SectionTitle groupName={groupName} groupId={groupId} />
      </div>
    </>
  );
};
