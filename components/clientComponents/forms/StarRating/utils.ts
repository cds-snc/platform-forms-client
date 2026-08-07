import { StarRatingObject } from "@lib/types";

export const parseStarRatingAnswer = (answer: unknown): StarRatingObject | undefined => {
  if (
    answer !== null &&
    typeof answer === "object" &&
    "value" in answer &&
    "numberOfStars" in answer
  ) {
    return answer as StarRatingObject;
  }
};

export const formatStarRating = (
  value: string | number | undefined,
  numberOfStars: number
): string => {
  if (!value || value === "-" || numberOfStars <= 0) {
    return String(value);
  }

  return `${value}/${numberOfStars}`;
};

/**
 * Formats a star rating answer as a fraction string (e.g. "3/5").
 * Returns "-" if the answer is not a valid StarRatingObject.
 */
export const formatStarRatingAnswer = (rawAnswer: unknown): string => {
  const parsed = parseStarRatingAnswer(rawAnswer);
  return parsed ? formatStarRating(parsed.value, parsed.numberOfStars) : "-";
};
