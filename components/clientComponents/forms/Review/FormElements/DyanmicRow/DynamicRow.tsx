import { FormItem } from "../../helpers";
import { FormItemFactory } from "../../FormItemFactory";
import { Language } from "@lib/types/form-builder-types";
import { randomId } from "@lib/client/clientHelpers";
import { getReviewSectionFromDynamicRows } from "./helpers";

const getDynamicRowElements = (formItem: FormItem, language: Language) => {
  if (!Array.isArray(formItem.values)) {
    return <></>;
  }
  return formItem.values.map((element) => {
    return <FormItemFactory key={randomId()} formItem={element as FormItem} language={language} />;
  });
};

// Note: DynamicRow = Sub Elements = Repeating Sets = {more names ?}
export const DynamicRow = ({ formItem, language }: { formItem: FormItem; language: Language }) => {
  const reviewSection = getReviewSectionFromDynamicRows(formItem, language);
  if (!Array.isArray(reviewSection?.values)) {
    return <></>;
  }

  return (
    <div>
      <h4>{(formItem as FormItem).label}</h4>
      {reviewSection.values.map((formItem, index) => {
        const dynamicRowElements = getDynamicRowElements(formItem as FormItem, language);
        return (
          <dl className="mb-10 mt-12" key={`${(formItem as FormItem).element?.id}-${index}`}>
            <h5 className="mb-8">{(formItem as FormItem).label}</h5>
            {dynamicRowElements}
          </dl>
        );
      })}
    </div>
  );
};
