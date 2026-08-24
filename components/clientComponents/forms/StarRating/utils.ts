import { FormElementTypes } from "@lib/types";
import { Answer } from "@root/lib/responseDownloadFormats/types";
import type { StarRatingObject } from "./types";

/**
 * Utility function to use when rendering a formatted star rating string
 *
 * @param item
 * @returns string
 */
export const getFormattedStarRatingFromObject = (item: Answer): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  const parsed = parseStarRatingAnswer(String(item.answer));
  if (!parsed) {
    return "-";
  }

  return formatStarRating(parsed.value, parsed.numberOfStars);
};

export const parseStarRatingAnswer = (answer: string): StarRatingObject | undefined => {
  try {
    const parsed: unknown = JSON.parse(answer);
    return isValidStarRatingObject(parsed) ? parsed : undefined;
  } catch {
    // Not a valid star rating JSON object
  }
};

/**
 * Formats a star rating answer (e.g. "3 out of 5").
 * Returns the raw answer unchanged if unparseable, or "-" if empty.
 */
export const formatStarRatingAnswer = (rawAnswer: string): string => {
  const parsed = parseStarRatingAnswer(rawAnswer);
  return parsed ? formatStarRating(parsed.value, parsed.numberOfStars) : rawAnswer || "-";
};

/**
 * Check that a star rating object is valid
 *
 * @param obj
 * @returns boolean
 */
export const isValidStarRatingObject = (obj: unknown): obj is StarRatingObject => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "value" in obj &&
    "numberOfStars" in obj &&
    typeof obj.value === "number" &&
    typeof obj.numberOfStars === "number"
  );
};

export const getStarRatingScoreFromObject = (rating: StarRatingObject): number => {
  return rating.value;
};

export const formatStarRating = (
  value: string | number | undefined,
  numberOfStars: number
): string => {
  if (!value || value === "-" || numberOfStars <= 0) {
    return String(value);
  }

  return `${value} out of ${numberOfStars}`;
};
