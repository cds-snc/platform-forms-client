import type { SharedElementDefinition } from "@lib/form-elements/sharedHooks";
import type { FormElement } from "@lib/types";
import type { ResponseFilenameMapping } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses-pilot/lib/processResponse";

export const fileInputDataDefinition: SharedElementDefinition = {
  answerToString: (
    question: FormElement,
    answer: unknown,
    attachments?: ResponseFilenameMapping
  ): string => {
    if (!answer || typeof answer !== "object" || !("name" in answer)) {
      return "";
    }

    let id: string | null = null;
    if ("id" in answer) {
      id = (answer as { id: string }).id;
    }

    const attachment = id ? attachments?.get(id) : undefined;
    const prefix = attachment?.isPotentiallyMalicious ? "⚠️ " : "";
    return attachment ? prefix + attachment.actualName : (answer as { name: string }).name || "";
  },
};

export default fileInputDataDefinition;
