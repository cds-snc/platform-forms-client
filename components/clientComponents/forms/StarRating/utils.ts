import { FormElementTypes } from "@lib/types";
import { Answer } from "@root/lib/responseDownloadFormats/types";
import type { StarRatingObject } from "./types";

export const parseStarRatingAnswer = (answer: string): StarRatingObject | undefined => {
  try {
    const parsed: StarRatingObject = JSON.parse(answer);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "value" in parsed &&
      "numberOfStars" in parsed
    ) {
      return parsed;
    }
  } catch {
    // Not a valid star rating JSON object
  }
};

export const getStarRatingAsString = (rating: StarRatingObject): string => {
  return `${rating.value}/${rating.numberOfStars}`;
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
 * Returns the raw answer unchanged if unparseable, or "-" if empty.
 */
export const formatStarRatingAnswer = (rawAnswer: string): string => {
  const parsed = parseStarRatingAnswer(rawAnswer);
  return parsed ? formatStarRating(parsed.value, parsed.numberOfStars) : rawAnswer || "-";
};

/**
 * Prefixes a Star Rating CSV value so Excel keeps the fraction as text instead of parsing it as a date.
 */
export const formatStarRatingAnswerForCsv = (rawAnswer: string): string => {
  return `'${formatStarRatingAnswer(rawAnswer)}`;
};

export const checkAndformatStarRatingAnswer = (item: Answer): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  return formatStarRatingAnswer(String(item.answer));
};
