import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useHandleAdd } from "@lib/hooks/form-builder";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";

export const NewSection = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation("form-builder");
  const { handleAddElement } = useHandleAdd();

  if (groupId === "start" || groupId === "end") {
    return null;
  }

  return (
    <div className="flex mb-10 justify-center ">
      <AddElementButton
        handleAdd={(type?: FormElementTypes) => {
          handleAddElement(-1, type);
        }}
        text={t("addElement")}
      />
    </div>
  );
};
