import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { getFormattedStarRatingFromObject } from "../../StarRating/utils";

export const StarRating = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const starRatingAnswer = getFormattedStarRatingFromObject({
    type: formItem.type,
    answer: formItem.values,
  });

  if (!starRatingAnswer) {
    return <BaseElement formItem={formItem} />;
  }

  const formItemAsRating = {
    ...formItem,
    values: starRatingAnswer,
  } as FormItem;

  return <BaseElement formItem={formItemAsRating} />;
};
