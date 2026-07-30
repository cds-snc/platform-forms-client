import { StarRatingObject } from "@lib/types";

// Note: The answer is stored as a JSON object e.g. `{"value":3,"numberOfStars":5}`.
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
