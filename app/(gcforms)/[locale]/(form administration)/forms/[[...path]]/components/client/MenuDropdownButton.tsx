"use client";
import {
  MenuDropdown,
  MenuDropdownItemI,
} from "@clientComponents/myforms/MenuDropdown/MenuDropdown";
import { useTranslation } from "react-i18next";

export const MenuDropdownButton = ({
  id,
  menuItemsList,
  direction,
}: {
  id: string;
  menuItemsList: MenuDropdownItemI[];
  direction: string;
}) => {
  const { t } = useTranslation(["my-forms", "common"]);
  return (
    <MenuDropdown id={id} items={menuItemsList} direction={direction}>
      <span className="mr-1 text-[2rem]" aria-hidden="true">
        ⋮
      </span>
      {t("card.menu.more")}
    </MenuDropdown>
  );
};
