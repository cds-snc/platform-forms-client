import {
  CheckAllIcon,
  CheckBoxEmptyIcon,
  CheckIndeterminateIcon,
} from "@components/form-builder/icons";
import { VaultSubmissionList } from "@lib/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { ReducerTableItemsActions, TableActions } from "./DownloadTableReducer";
import { Tooltip } from "../shared/Tooltip";

export const CheckAll = ({
  tableItems,
  tableItemsDispatch,
  noSelectedItemsError,
  setNoSelectedItemsError,
}: {
  tableItems: {
    checkedItems: Map<string, boolean>;
    statusItems: Map<string, boolean>;
    sortedItems: VaultSubmissionList[];
    numberOfOverdueResponses: number;
  };
  tableItemsDispatch: React.Dispatch<ReducerTableItemsActions>;
  noSelectedItemsError: boolean;
  setNoSelectedItemsError: (noSelectedItemsError: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  enum allCheckedState {
    NONE = "NONE",
    SOME = "SOME",
    ALL = "ALL",
  }

  const { checkedItems, sortedItems } = tableItems;

  const checkedItemsCount = checkedItems.size;
  const sortedItemsCount = sortedItems.length;

  // Are all items checked, some items checked, or no items checked?
  const checkAllStatus =
    checkedItemsCount === 0
      ? allCheckedState.NONE
      : checkedItemsCount === sortedItemsCount
      ? allCheckedState.ALL
      : allCheckedState.SOME;

  /**
   * Check all items if none are checked, otherwise uncheck all items.
   */
  const handleCheckAll = () => {
    if (checkAllStatus === allCheckedState.NONE) {
      sortedItems.forEach((submission) => {
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
    <Tooltip text={tooltip} side="top">
      <span
        className="m-auto inline-block cursor-pointer"
        role="checkbox"
        aria-checked={
          checkAllStatus === allCheckedState.ALL
            ? "true"
            : checkAllStatus === allCheckedState.SOME
            ? "mixed"
            : "false"
        }
        tabIndex={0}
        onClick={handleCheckAll}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCheckAll();
          }
        }}
      >
        {checkAllStatus === allCheckedState.ALL && (
          <CheckAllIcon title={tooltip} className="h-6 w-6" />
        )}
        {checkAllStatus === allCheckedState.SOME && (
          <CheckIndeterminateIcon title={tooltip} className="h-6 w-6" />
        )}
        {checkAllStatus === allCheckedState.NONE && (
          <CheckBoxEmptyIcon title={tooltip} className="h-6 w-6" />
        )}
      </span>
    </Tooltip>
  );
};
