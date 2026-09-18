import { DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { getFormattedDateResponse } from "@clientComponents/forms/FormattedDate/utils";
import { getAddressCompleteResponse } from "@clientComponents/forms/AddressComplete/utils";
import { getStarRatingResponse } from "@clientComponents/forms/StarRating/utils";

import { FormElement, FormElementTypes } from "@gcforms/types";
import { ResponseFilenameMapping } from "@formBuilder/[id]/responses-pilot/lib/processResponse";

export const getAnswerAsString = (
  question: FormElement | undefined,
  answer: unknown,
  attachments?: ResponseFilenameMapping
): string => {
  if (question && question.type === FormElementTypes.checkbox) {
    return Array(answer).join(", ");
  }

  if (question && question.type === FormElementTypes.fileInput) {
    if (!answer || typeof answer !== "object" || !("name" in answer)) {
      return ""; // If the answer is not an object or does not have a name, return empty string
    }

    let id = null;
    if ("id" in answer) {
      id = (answer as { id: string }).id;
    }

    const attachment = attachments?.get(id as string);
    const prefix = attachment?.isPotentiallyMalicious ? "⚠️ " : "";

    return attachment ? prefix + attachment.actualName : (answer as { name: string }).name || "";
  }

  if (question && question.type === FormElementTypes.formattedDate) {
    // Could be empty if the date was not required
    if (!answer) {
      return "";
    }

    const dateFormat = (question.properties.dateFormat || "YYYY-MM-DD") as DateFormat;

    return getFormattedDateResponse(answer as string | object, dateFormat);
  }

  if (question && question.type === FormElementTypes.addressComplete) {
    if (!answer) {
      return "";
    }

    return getAddressCompleteResponse(answer, question.properties.addressComponents?.splitAddress);
  }

  if (question && question.type === FormElementTypes.starRating) {
    return getStarRatingResponse(answer);
  }

  return answer as string;
};
