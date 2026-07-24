import { FormElementTypes, FormRecord } from "@lib/types";

import { Answer } from "../types";

export type StarRatingObject = { value: number; numberOfStars: number };

/**
 * Formats a star rating answer as a fraction string (e.g. "3/5").
 * Returns `undefined` when the item is not a star rating element.
 * Returns the raw answer unchanged when it is empty or already a placeholder.
 *
 * The answer is stored as a JSON object e.g. `{"value":3,"numberOfStars":5}`.
 */
export const formatStarRatingAnswer = (
  item: Answer,
  _formRecord: FormRecord
): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  const rawAnswer = String(item.answer);

  if (!rawAnswer || rawAnswer === "-") {
    return rawAnswer;
  }

  try {
    const parsed = JSON.parse(rawAnswer) as StarRatingObject;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "value" in parsed &&
      "numberOfStars" in parsed
    ) {
      return `${parsed.value}/${parsed.numberOfStars}`;
    }
  } catch {
    // Not a valid star rating JSON object
  }

  return rawAnswer;
};
