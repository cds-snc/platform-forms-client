import { ArrowDownIcon } from "../icons/ArrowDownIcon";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { HamburgerIcon } from "../icons/HamburgerIcon";

import { ItemProps } from "../types";
import { useElementType } from "../hooks/useElementType";

export const ItemIcon = ({ item }: ItemProps) => {
  const { isSectionElement, isRepeatingSet } = useElementType(item);
  return (
    <>
      {isSectionElement && (
        <span className="mx-2 inline-block">
          {item.isExpanded() ? <ArrowDownIcon /> : <ArrowRightIcon />}
        </span>
      )}
      {isRepeatingSet && (
        <span className="mr-2 inline-block">
          <HamburgerIcon />
        </span>
      )}
    </>
  );
};
