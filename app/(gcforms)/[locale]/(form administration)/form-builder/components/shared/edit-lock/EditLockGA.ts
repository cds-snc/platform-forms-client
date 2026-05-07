import { ga } from "@root/lib/client/clientHelpers";

/**
 * Sends a Google Analytics event for edit lock interactions.
 * @param {string} formId - The ID of the form being edited.
 * @param {string} description - A description of the edit lock event (e.g. "start_read_only").
 * @param {Record<string, unknown>} [extra] - Optional additional key-value pairs to include in the event payload.
 */
export const gaEditLock = ({
  formId,
  description,
  extra,
}: {
  formId: string;
  description: string;
  extra?: Record<string, unknown>;
}) => {
  ga("edit_lock", {
    formId,
    timestamp: Date.now(),
    description: description,
    ...extra,
  });
};
