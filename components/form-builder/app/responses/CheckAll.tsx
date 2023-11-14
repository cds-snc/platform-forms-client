import {
  CheckAllIcon,
  CheckBoxEmptyIcon,
  CheckIndeterminateIcon,
} from "@components/form-builder/icons";
import { TypeOmit, VaultSubmission } from "@lib/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { ReducerTableItemsActions, TableActions } from "./DownloadTableReducer";

export const CheckAll = ({
  tableItems,
  tableItemsDispatch,
  errors,
  setErrors,
  responseDownloadLimit,
}: {
  tableItems: {
    checkedItems: Map<string, boolean>;
    statusItems: Map<string, boolean>;
    sortedItems: TypeOmit<
      VaultSubmission,
      "formSubmission" | "submissionID" | "confirmationCode"
    >[];
    numberOfOverdueResponses: number;
  };
  tableItemsDispatch: React.Dispatch<ReducerTableItemsActions>;
  errors: {
    downloadError: boolean;
    maxItemsError: boolean;
    noItemsError: boolean;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      downloadError: boolean;
      maxItemsError: boolean;
      noItemsError: boolean;
    }>
  >;
  responseDownloadLimit: number;
}) => {
  const { t } = useTranslation("form-builder-responses");

  enum allCheckedState {
    NONE = "NONE",
    SOME = "SOME",
    ALL = "ALL",
  }

  const MAX_FILE_DOWNLOADS = responseDownloadLimit;

  /**
   * Are all items checked, some items checked, or no items checked?
   * @returns {allCheckedState} The current state of the checked items.
   */
  const checkAllStatus = () => {
    if (tableItems.checkedItems.size === 0) {
      return allCheckedState.NONE;
    }
    if (tableItems.checkedItems.size === tableItems.sortedItems.length) {
      return allCheckedState.ALL;
    }
    return allCheckedState.SOME;
  };

  /**
   * Check all items if none are checked, otherwise uncheck all items.
   */
  const handleCheckAll = () => {
    if (checkAllStatus() === allCheckedState.NONE) {
      tableItems.sortedItems.forEach((submission) => {
        tableItemsDispatch({
          type: TableActions.UPDATE,
          payload: { item: { name: submission.name, checked: true } },
        });
      });
    } else {
      tableItems.checkedItems.forEach((_, key) => {
        tableItemsDispatch({
          type: TableActions.UPDATE,
          payload: { item: { name: key, checked: false } },
        });
      });
    }

    // Show or hide errors depending
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && !errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: true });
    } else if (errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: false });
    }
    if (tableItems.checkedItems.size > 0 && errors.noItemsError) {
      setErrors({ ...errors, noItemsError: false });
    }
  };

  return (
    <span
      className="cursor-pointer"
      role="checkbox"
      aria-checked={
        checkAllStatus() === allCheckedState.ALL
          ? "true"
          : checkAllStatus() === allCheckedState.SOME
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
      {checkAllStatus() === allCheckedState.ALL && (
        <CheckAllIcon
          title={t("downloadResponsesTable.header.deselectAll")}
          className="m-auto h-6 w-6"
        />
      )}
      {checkAllStatus() === allCheckedState.SOME && (
        <CheckIndeterminateIcon
          title={t("downloadResponsesTable.header.deselectAll")}
          className="m-auto h-6 w-6"
        />
      )}
      {checkAllStatus() === allCheckedState.NONE && (
        <CheckBoxEmptyIcon
          title={t("downloadResponsesTable.header.selectAll")}
          className="m-auto h-6 w-6"
        />
      )}
    </span>
  );
};
