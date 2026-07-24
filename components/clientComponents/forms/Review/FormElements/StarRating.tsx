import { safeJSONParse } from "@lib/utils";
import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { StarRatingObject } from "@lib/responseDownloadFormats/utils/formatStarRatingAnswer";

export const StarRating = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const parsed = safeJSONParse<StarRatingObject>(formItem.values as string);

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("value" in parsed) ||
    !("numberOfStars" in parsed)
  ) {
    return <BaseElement formItem={formItem} />;
  }

  const formItemAsRating = {
    ...formItem,
    values: `${parsed.value}/${parsed.numberOfStars}`,
  } as FormItem;

  return <BaseElement formItem={formItemAsRating} />;
};
