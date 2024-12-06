import { randomId } from "@lib/client/clientHelpers";
import { SubElements } from "./SubElements";
import { ReviewElement, ReviewItem } from "./reviewUtils";

export const QuestionsAnswersList = ({
  reviewItem,
}: {
  reviewItem: ReviewItem;
}): React.ReactElement => {
  return (
    <dl className="my-10">
      {Array.isArray(reviewItem.elements) &&
        reviewItem.elements.map((reviewElement) => {
          if (Array.isArray(reviewElement.values)) {
            return (
              <SubElements key={randomId()} elements={reviewElement.values as ReviewElement[]} />
            );
          }
          return (
            <div key={randomId()} className="mb-8">
              <dt className="mb-2 font-bold">{reviewElement.title}</dt>
              <dd>{reviewElement.values as string}</dd>
            </div>
          );
        })}
    </dl>
  );
};
