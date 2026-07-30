import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { parseStarRatingAnswer } from "../../StarRating/utils";

export const StarRating = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const parsed = parseStarRatingAnswer(formItem.values as string);

  if (!parsed) {
    return <BaseElement formItem={formItem} />;
  }

  const formItemAsRating = {
    ...formItem,
    values: `${parsed.value}/${parsed.numberOfStars}`,
  } as FormItem;

  return <BaseElement formItem={formItemAsRating} />;
};
