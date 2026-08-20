import { FormElementTypes } from "@lib/types";
import { Answer } from "@root/lib/responseDownloadFormats/types";

export const formatStarRatingAnswer = (rawAnswer: string): string => {
  return rawAnswer || "-";
};

export const checkAndformatStarRatingAnswer = (item: Answer): string | undefined => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  return formatStarRatingAnswer(String(item.answer));
};
