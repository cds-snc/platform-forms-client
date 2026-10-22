"use client";
import { CheckAllIcon, CheckBoxEmptyIcon, CheckIndeterminateIcon } from "@serverComponents/icons";
import { VaultSubmissionOverview } from "@lib/types";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ReducerTableItemsActions, TableActions } from "./DownloadTableReducer";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";

export const CheckAll = ({
  tableItems,
  tableItemsDispatch,
  noSelectedItemsError,
  setNoSelectedItemsError,
  isItemDisabled,
}: {
  tableItems: {
    checkedItems: Map<string, boolean>;
    statusItems: Map<string, boolean>;
    allItems: VaultSubmissionOverview[];
    numberOfOverdueResponses: number;
  };
  tableItemsDispatch: React.Dispatch<ReducerTableItemsActions>;
  noSelectedItemsError: boolean;
  setNoSelectedItemsError: (noSelectedItemsError: boolean) => void;
  isItemDisabled?: (submission: VaultSubmissionOverview) => boolean;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const allCheckedState = {
    NONE: "NONE",
    SOME: "SOME",
    ALL: "ALL",
  } as const;
  type allCheckedState = (typeof allCheckedState)[keyof typeof allCheckedState];

  const { checkedItems, allItems } = tableItems;

  const checkedItemsCount = checkedItems.size;
  const selectableItems = allItems.filter((submission) => !isItemDisabled?.(submission));
  const allItemsCount = selectableItems.length;

  // Are all items checked, some items checked, or no items checked?
  const checkAllStatus =
    checkedItemsCount === 0
      ? allCheckedState.NONE
      : checkedItemsCount === allItemsCount
        ? allCheckedState.ALL
        : allCheckedState.SOME;

  /**
   * Check all items if none are checked, otherwise uncheck all items.
   */
  const handleCheckAll = () => {
    if (allItemsCount === 0) return;
    if (checkAllStatus === allCheckedState.NONE) {
      selectableItems.forEach((submission) => {
        tableItemsDispatch({
          type: TableActions.UPDATE,
          payload: { item: { name: submission.name, checked: true } },
        });
      });
      if (noSelectedItemsError) {
        setNoSelectedItemsError(false);
      }
    } else {
      checkedItems.forEach((_, key) => {
        tableItemsDispatch({
          type: TableActions.UPDATE,
          payload: { item: { name: key, checked: false } },
        });
      });
    }
  };

  const tooltip =
    checkAllStatus === allCheckedState.NONE
      ? t("downloadResponsesTable.header.selectAll")
      : t("downloadResponsesTable.header.deselectAll");

  return (
    <Tooltip.Simple text={tooltip} side="top">
      <span
        className="m-auto inline-block cursor-pointer"
        role="checkbox"
        aria-disabled={allItemsCount === 0}
        aria-checked={
          checkAllStatus === allCheckedState.ALL
            ? "true"
            : checkAllStatus === allCheckedState.SOME
              ? "mixed"
              : "false"
        }
        tabIndex={allItemsCount === 0 ? -1 : 0}
        onClick={handleCheckAll}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCheckAll();
          }
        }}
      >
        {checkAllStatus === allCheckedState.ALL && (
          <CheckAllIcon title={tooltip} className="size-6" />
        )}
        {checkAllStatus === allCheckedState.SOME && (
          <CheckIndeterminateIcon title={tooltip} className="size-6" />
        )}
        {checkAllStatus === allCheckedState.NONE && (
          <CheckBoxEmptyIcon title={tooltip} className="size-6" />
        )}
      </span>
    </Tooltip.Simple>
  );
};
