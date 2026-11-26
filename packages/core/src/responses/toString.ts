import {
  FormElement,
  FormElementTypes,
  type AddressElements,
  type DateFormat,
  type DateObject,
} from "@gcforms/types";
import type { ResponseFilenameMapping } from "./types";

const addressLabels = {
  streetAddress: ["Street address", "Adresse municipale"],
  city: ["City or town", "Ville ou communauté"],
  province: ["Province, territory, or state", "Province, territoire ou état"],
  postalCode: ["Postal or zip code", "Code postal ou zip"],
  country: ["Country", "Pays"],
} as const;

const getFormattedDateResponse = (answer: string | object, dateFormat: DateFormat): string => {
  try {
    const dateObject = typeof answer === "object" ? answer : (JSON.parse(answer) as DateObject);

    if (
      !dateObject ||
      typeof dateObject !== "object" ||
      !("YYYY" in dateObject) ||
      !("MM" in dateObject) ||
      !("DD" in dateObject)
    ) {
      return answer as string;
    }

    const { YYYY, MM, DD } = dateObject as DateObject;
    return dateFormat
      .replace("YYYY", YYYY.toString())
      .replace("MM", MM.toString().padStart(2, "0"))
      .replace("DD", DD.toString().padStart(2, "0"));
  } catch {
    return answer as string;
  }
};

const getAddressCompleteResponse = (answer: unknown, split?: boolean): string => {
  try {
    const address =
      typeof answer === "string"
        ? (JSON.parse(answer) as AddressElements)
        : (answer as AddressElements);

    if (!address) return "";
    if (split) {
      return Object.entries(address)
        .map(([key, value]) => {
          const labels = addressLabels[key as keyof typeof addressLabels];
          return `${labels?.[0] ?? key}\n${labels?.[1] ?? key}: ${value}\n`;
        })
        .join("");
    }

    if (
      address.streetAddress === "" &&
      address.city === "" &&
      address.province === "" &&
      address.postalCode === ""
    ) {
      return "";
    }

    return `${address.streetAddress}, ${address.city}, ${address.province} ${address.postalCode} ${address.country}`;
  } catch {
    return answer as string;
  }
};

export const getAnswerAsString = (
  question: FormElement | undefined,
  answer: unknown,
  attachments?: ResponseFilenameMapping
): string => {
  if (question?.type === FormElementTypes.checkbox) {
    return Array(answer).join(", ");
  }

  if (question?.type === FormElementTypes.fileInput) {
    if (!answer || typeof answer !== "object" || !("name" in answer)) {
      return "";
    }

    const file = answer as { id?: string; name: string };
    const attachment = file.id ? attachments?.get(file.id) : undefined;
    const prefix = attachment?.isPotentiallyMalicious ? "⚠️ " : "";
    return attachment ? prefix + attachment.actualName : file.name || "";
  }

  if (question?.type === FormElementTypes.formattedDate) {
    if (!answer) return "";
    const dateFormat = (question.properties.dateFormat || "YYYY-MM-DD") as DateFormat;
    return getFormattedDateResponse(answer as string | object, dateFormat);
  }

  if (question?.type === FormElementTypes.addressComplete) {
    if (!answer) return "";
    return getAddressCompleteResponse(answer, question.properties.addressComponents?.splitAddress);
  }

  if (question?.type === FormElementTypes.starRating) {
    return answer ? JSON.stringify(answer) : "";
  }

  return answer as string;
};
