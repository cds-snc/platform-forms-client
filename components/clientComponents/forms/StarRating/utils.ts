import { FormElementTypes } from "@lib/types";
import type { FormRecord } from "@gcforms/types";
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

export const getStarRatingNumberOfStars = (formRecord: FormRecord, questionId: number): number => {
  return (
    formRecord.form.elements.find((element) => element.id === questionId)?.properties
      .numberOfStars ?? 5
  );
};

type TranslationFn = (key: string, options?: Record<string, unknown>) => string;
type HeaderStrings = { stringEn: string | undefined; stringFr: string | undefined } | undefined;

export const getStarRatingHeaderStrings = (
  item: Pick<Answer, "questionEn" | "questionFr"> & { type?: string },
  numberOfStars: number,
  t: TranslationFn
): HeaderStrings => {
  if (item.type !== FormElementTypes.starRating) {
    return undefined;
  }

  return {
    stringEn: `${item.questionEn} (${t("starRating.outOf", {
      ns: "common",
      lng: "en",
      count: numberOfStars,
    })})`,
    stringFr: `${item.questionFr} (${t("starRating.outOf", {
      ns: "common",
      lng: "fr",
      count: numberOfStars,
    })})`,
  };
};
