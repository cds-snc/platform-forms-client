import { AddressElements } from "@clientComponents/forms/AddressComplete/types";
import { getAddressAsString } from "@clientComponents/forms/AddressComplete/utils";
import { getSharedElementDefinition } from "@lib/form-elements/registry";

import { FormElement } from "@root/packages/types/src/form-types";
import { ResponseFilenameMapping } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot/lib/processResponse";

export const getAnswerAsString = (
  question: FormElement | undefined,
  answer: unknown,
  attachments?: ResponseFilenameMapping
): string => {
  const sharedElementDefinition = question ? getSharedElementDefinition(question.type) : undefined;
  if (question && sharedElementDefinition?.answerToString) {
    return sharedElementDefinition.answerToString(question, answer, attachments);
  }

  if (question && question.type === "checkbox") {
    return Array(answer).join(", ");
  }

  if (question && question.type === "fileInput") {
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

  if (question && question.type === "addressComplete") {
    if (!answer) {
      return "";
    }

    if (question.properties.addressComponents?.splitAddress === true) {
      return answer as string; //Address was split, return as is.
    }

    try {
      const addressObject = JSON.parse(answer as string) as AddressElements;
      return getAddressAsString(addressObject);
    } catch (e) {
      // If the answer is somehow not parseable as JSON, return it as is
      return answer as string;
    }
  }

  return answer as string;
};
