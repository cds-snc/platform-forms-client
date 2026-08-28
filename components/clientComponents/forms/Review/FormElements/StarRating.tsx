import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { getFormattedStarRatingFromObject } from "../../StarRating/utils";
import { Language } from "@lib/types/form-builder-types";

export const StarRating = ({
  formItem,
  language,
}: {
  formItem: FormItem | undefined;
  language: Language;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const starRatingAnswer = getFormattedStarRatingFromObject(formItem.values as string, language);

  if (!starRatingAnswer) {
    return <BaseElement formItem={formItem} />;
  }

  const formItemAsRating = {
    ...formItem,
    values: starRatingAnswer,
  } as FormItem;

  return <BaseElement formItem={formItemAsRating} />;
};
