import { randomId } from "@lib/client/clientHelpers";
import { formatElementValues, ReviewElement } from "./reviewUtils";

// Handle formatting Sub Elements. Note Sub Elements = Dynamic Rows = Repeating Sets.
export const SubElements = ({ elements }: { elements: ReviewElement[] }) => {
  return elements?.map((subElementItem) => {
    return (subElementItem.values as ReviewElement[])?.map((element) => {
      if (Array.isArray(element.values)) {
        const dlId = randomId();
        // Create a nested DL for each Sub Element list
        return (
          <dl key={dlId} aria-labelledby={dlId} className="my-10">
            <h4 className="italic" id={dlId}>
              {element.title}
            </h4>
            {(element.values as ReviewElement[]).map((elementValues) => {
              return (
                <div key={randomId()} className="mb-2">
                  <dt className="mb-2 font-bold">{elementValues.title}</dt>

                  <dd>{formatElementValues(elementValues)}</dd>
                </div>
              );
            })}
          </dl>
        );
      }
      return (
        <div key={randomId()} className="mb-2">
          <dt className="mb-2 font-bold">{element.title}</dt>
          <dd>{formatElementValues(element)}</dd>
        </div>
      );
    });
  });
};
