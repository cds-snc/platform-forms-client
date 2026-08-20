import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";
import { getFormattedDateFromObject } from "@clientComponents/forms/FormattedDate/utils";
import { AddressElements } from "@clientComponents/forms/AddressComplete/types";
import { getAddressAsString } from "@clientComponents/forms/AddressComplete/utils";

import { FormElement, FormElementTypes } from "@root/packages/types/src/form-types";
import { ResponseFilenameMapping } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot/lib/processResponse";
const getDateAsString = (answer: DateObject | string | object, dateFormat: DateFormat): string => {
  try {
    if (typeof answer === "object" && "YYYY" in answer && "MM" in answer && "DD" in answer) {
      const dateObject = answer as unknown as DateObject;
      return getFormattedDateFromObject(dateFormat, dateObject);
    }

    const dateObject = JSON.parse(answer as string) as DateObject;
    return getFormattedDateFromObject(dateFormat, dateObject);
  } catch (e) {
    return answer as string;
  }
};

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

    return getDateAsString(answer, dateFormat);
  }

  if (question && question.type === FormElementTypes.addressComplete) {
    if (!answer) {
      return "";
    }

    try {
      const addressObject = answer as AddressElements;
      return getAddressAsString(addressObject, question.properties.addressComponents?.splitAddress);
    } catch (e) {
      // If the answer is somehow not parseable as JSON, return it as is
      return answer as string;
    }
  }

  return answer as string;
};
