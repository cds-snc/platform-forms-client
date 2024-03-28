import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@clientComponents/globals";
import { v4 as uuid } from "uuid";
import { useGroupStore } from "./store";

export const TreeView = () => {
  //const treeRef = useTreeRef();

  const { t } = useTranslation("form-builder");

  // const { groups, addGroup, controllers } = useDynamicTree();
  const { setId } = useGroupStore((s) => {
    return { id: s.id, setId: s.setId };
  });

  return (
    <div className="relative mr-[1px]">
      <div className="m-4 flex">
        <Button
          theme="secondary"
          onClick={() => {
            const id = uuid();
            setId(id);
          }}
        >
          {t("rightPanel.treeView.addSection")}
        </Button>

        <div>Tree Here</div>
      </div>
    </div>
  );
};
