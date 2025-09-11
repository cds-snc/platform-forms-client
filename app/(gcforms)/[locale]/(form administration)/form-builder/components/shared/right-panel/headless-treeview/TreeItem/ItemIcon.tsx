import { ArrowDown } from "../icons/ArrowDown";
import { ArrowRight } from "../icons/ArrowRight";
import { Hamburger } from "../icons/Hamburger";

import { ItemProps } from "../types";
import { useElementType } from "../hooks/useElementType";

export const ItemIcon = ({ item }: ItemProps) => {
  const { isSectionElement, isRepeatingSet } = useElementType(item);
  return (
    <>
      {isSectionElement && (
        <span className="mx-2 inline-block">
          {item.isExpanded() ? <ArrowDown /> : <ArrowRight />}
        </span>
      )}
      {isRepeatingSet && (
        <span className="mr-2 inline-block">
          <Hamburger />
        </span>
      )}
    </>
  );
};
