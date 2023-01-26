import React from "react";
import { useTranslation } from "next-i18next";
import { UseSelectStateChange } from "downshift";

import { DropDown } from "../edit/elements";
import { ShareIcon } from "@formbuilder/icons";
import { ElementOption } from "@formbuilder/types";

export const ShareDropdown = () => {
  const { t } = useTranslation("form-builder");

  const handleChange = (changes: UseSelectStateChange<ElementOption | null | undefined>) => {
    alert(changes.selectedItem?.value);
  };

  const options = [{ id: "email", value: t("share.email"), icon: <ShareIcon />, className: "" }];

  return (
    <div className="form-builder mt-[-8px]">
      <DropDown
        ariaLabel={t("share.title")}
        items={options}
        selectedItem={{ id: "share", value: t("share.title"), className: "" }}
        onChange={handleChange}
      />
    </div>
  );
};
