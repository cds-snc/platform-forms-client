import { ReviewItem } from "./Review";
import { FormElementTypes } from "@lib/types";
import { BaseElement } from "./BaseElement";
import { BaseElementArray } from "./BaseElementArray";
import { DynamicRowElement } from "./DynamicRowElement";
import { FormValues } from "@lib/formContext";
// import { ReviewElement, ReviewItem } from "./reviewUtils";

export const QuestionsAnswersList = ({
  reviewItem,
}: {
  reviewItem: ReviewItem;
}): React.ReactElement => {
  if (!Array.isArray(reviewItem.formItems)) {
    return <></>;
  }

  return (
    <dl className="my-10">
      {reviewItem.formItems.map((formItem) => {
        if (Array.isArray(formItem.values)) {
          if (formItem.originalFormElement?.type === FormElementTypes.dynamicRow) {
            return <DynamicRowElement formItem={formItem} />
          }

          if (formItem.originalFormElement?.type === FormElementTypes.addressComplete) {
            // TODO
          }

          // return (
          //   <SubElements key={randomId()} elements={formItem.values} />
          // );

          // Default: Base element 
          <BaseElementArray key={formItem.originalFormElement?.id} formItem={formItem} />;
        }
        return <BaseElement key={formItem.originalFormElement?.id} formItem={formItem} />;
      })}
    </dl>
  );
};
