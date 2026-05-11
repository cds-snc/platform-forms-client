import { ga } from "@root/lib/client/clientHelpers";

/**
 * Sends a Google Analytics event for edit lock interactions.
 * @param {object} params - The edit lock event details.
 * @param {string} params.formId - The ID of the form being edited.
 * @param {string} params.description - A description of the edit lock event (e.g. "start_read_only").
 * @param {Record<string, unknown>} [params.eventData] - Optional additional key-value pairs to include in the event payload.
 */
export const gaEditLock = ({
  formId,
  description,
  eventData,
}: {
  formId: string;
  description: string;
  eventData?: Record<string, unknown>;
}) => {
  ga("edit_lock", {
    ...eventData,
    formId,
    timestamp: Date.now(),
    description: description,
  });
};
