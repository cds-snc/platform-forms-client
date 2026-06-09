import { ArrowDownIcon } from "../icons/ArrowDownIcon";
import { ArrowRightIcon } from "../icons/ArrowRightIcon";
import { HamburgerIcon } from "../icons/HamburgerIcon";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { useTranslation } from "@i18n/client";

import { ItemProps } from "../types";
import { useElementType } from "../hooks/useElementType";

export const ExpandableIcon = ({
  item,
  isLoading = false,
}: ItemProps & { isLoading?: boolean }) => {
  const { t } = useTranslation("form-builder");
  const { isSectionElement, isRepeatingSet } = useElementType(item);
  return (
    <>
      {isSectionElement && (
        <span className="mr-3 inline-flex h-3.5 w-3.5 items-center justify-center">
          {isLoading ? (
            <>
              <SpinnerIcon className="size-3 animate-spin fill-indigo-700 text-slate-200" />
              <span className="sr-only">{t("loading")}</span>
            </>
          ) : item.isExpanded() ? (
            <ArrowDownIcon />
          ) : (
            <ArrowRightIcon />
          )}
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
