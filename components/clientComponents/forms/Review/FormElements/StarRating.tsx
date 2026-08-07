import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { formatStarRatingAnswer } from "../../StarRating/utils";

export const StarRating = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const starRatingAnswer = formatStarRatingAnswer(formItem.values);

  if (!starRatingAnswer) {
    return <BaseElement formItem={formItem} />;
  }

  const formItemAsRating = {
    ...formItem,
    values: starRatingAnswer,
  } as FormItem;

  return <BaseElement formItem={formItemAsRating} />;
};
