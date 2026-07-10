import { getElementOrSubElementById } from "@gcforms/core";
import { FormElementTypes, FormRecord } from "@lib/types";

import { Answer } from "../types";

const DEFAULT_NUMBER_OF_STARS = 5;

/**
 * Formats a star rating answer as a fraction string (e.g. "3/5").
 * Returns `undefined` when the item is not a star rating element.
 * Returns the raw answer unchanged when it is empty or already a placeholder.
 */
export const formatStarRatingAnswer = (
  item: Answer,
  formRecord: FormRecord
): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  const rawAnswer = String(item.answer);

  if (!rawAnswer || rawAnswer === "-") {
    return rawAnswer;
  }

  const element = getElementOrSubElementById(formRecord.form.elements, String(item.questionId));
  const numberOfStars = element?.properties.numberOfStars ?? DEFAULT_NUMBER_OF_STARS;

  return `${rawAnswer}/${numberOfStars}`;
};
