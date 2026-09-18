import type { StarRatingObject } from "./types";
import { Language } from "@lib/types/form-builder-types";

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

export const getFormattedStarRatingFromObject = (
  starRatingObject: StarRatingObject | string,
  lang: Language = "en"
): string => {
  if (typeof starRatingObject === "string") {
    try {
      starRatingObject = JSON.parse(starRatingObject);
    } catch {
      return "-";
    }
  }

  if (!isValidStarRatingObject(starRatingObject)) {
    return "-";
  }
  return lang === "en"
    ? `${starRatingObject.value} out of ${starRatingObject.numberOfStars}`
    : `${starRatingObject.value} sur ${starRatingObject.numberOfStars}`;
};

export const getStarRatingResponse = (answer: unknown): string => {
  if (!answer) {
    return "";
  }

  return JSON.stringify(answer as StarRatingObject);
};

export const getScoreFromStarRatingObject = (
  starRatingObject: StarRatingObject | string
): number | undefined => {
  if (typeof starRatingObject === "string") {
    try {
      starRatingObject = JSON.parse(starRatingObject);
    } catch {
      return undefined;
    }
  }

  if (!isValidStarRatingObject(starRatingObject)) {
    return undefined;
  }
  return starRatingObject.value;
};
