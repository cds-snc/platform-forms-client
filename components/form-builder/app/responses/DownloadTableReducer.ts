import { getDaysPassed } from "@lib/clientHelpers";
import { VaultSubmissionList, VaultStatus } from "@lib/types";

export enum TableActions {
  UPDATE = "UPDATE",
  RESET = "RESET",
}

interface ReducerTableItemsState {
  statusItems: Map<string, boolean>;
  checkedItems: Map<string, boolean>;
  sortedItems: VaultSubmissionList[];
  numberOfOverdueResponses: number;
  overdueAfter: string | undefined;
}

export interface ReducerTableItemsActions {
  type: string;
  payload: {
    item?: {
      name: string;
      checked: boolean;
    };
    vaultSubmissions?: VaultSubmissionList[];
  };
}

export const initialTableItemsState = (
  vaultSubmissions: VaultSubmissionList[],
  overdueAfter: string | undefined
) => {
  return {
    checkedItems: new Map(),
    statusItems: new Map(vaultSubmissions.map((submission) => [submission.name, false])),
    sortedItems: vaultSubmissions,
    numberOfOverdueResponses: vaultSubmissions.filter((submission) =>
      isSubmissionOverdue({
        status: submission.status,
        createdAt: submission.createdAt,
        overdueAfter,
      })
    ).length,
    overdueAfter,
  };
};

/**
 * Checks whether a form submission is overdue by looking at whether the download or the confirmed
 * user action is overdue. If so, true is returned otherwise false.
 */
export function isSubmissionOverdue({
  status,
  createdAt,
  overdueAfter,
}: {
  status: string;
  createdAt: number;
  overdueAfter: string | undefined;
}) {
  if (overdueAfter === undefined) return false;
  const overdueDays = parseInt(overdueAfter);
  if (isNaN(overdueDays)) return false;
  const isOverdue = overdueDays - getDaysPassed(createdAt) < 0;
  // Download is overdue
  if (status === VaultStatus.NEW && isOverdue) return true;
  // Confirmed is overdue
  if (status === VaultStatus.DOWNLOADED && isOverdue) return true;
  return false;
}

// Using a reducer to have more control over when the template is updated (reduces re-renders)
export const reducerTableItems = (
  state: ReducerTableItemsState,
  action: ReducerTableItemsActions
) => {
  const { type, payload } = action;
  switch (type) {
    case "UPDATE": {
      if (!payload.item) {
        throw Error("Table update dispatch missing item checkbox state");
      }
      const newStatusItems = new Map(state.statusItems);
      const newCheckedItems = new Map();
      // Find the related checkbox and set its checked state to match the UI. Also update the list
      // of checkedItems for later convienience. The below forEach does two "things" which is messy
      // but more efficient than using two forEach loops.
      state.statusItems.forEach((checked: boolean, name: string) => {
        if (name === payload.item?.name && checked !== payload.item.checked) {
          newStatusItems.set(name, payload.item.checked);
          // Add to checkedItems: case of updated checkbox and checked
          if (payload.item.checked) {
            newCheckedItems.set(name, true);
          }
        } else if (checked) {
          // Add to checkedItems: case of existing checkbox and checked
          newCheckedItems.set(name, true);
        }
      });

      return {
        ...state,
        checkedItems: newCheckedItems,
        statusItems: newStatusItems,
      };
    }

    case "RESET": {
      if (!payload.vaultSubmissions) {
        throw Error("Table sort dispatch missing vaultSubmissions");
      }
      return initialTableItemsState(payload.vaultSubmissions, state.overdueAfter);
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
};
