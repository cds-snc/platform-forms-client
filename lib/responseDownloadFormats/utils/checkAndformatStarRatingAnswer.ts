import { FormElementTypes } from "@lib/types";
import { Answer } from "../types";
import { formatStarRatingAnswer } from "@root/components/clientComponents/forms/StarRating/utils";

export const checkAndformatStarRatingAnswer = (item: Answer): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  const rawAnswer = String(item.answer);
  return formatStarRatingAnswer(rawAnswer);
};
