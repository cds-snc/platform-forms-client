import { FormValues } from "@lib/formContext";
import { FormItem } from "../../helpers";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormItemFactory } from "../../FormItemFactory";
import { Language } from "@lib/types/form-builder-types";
import { randomId } from "@lib/client/clientHelpers";
import { getReviewItemFromDynamicRows } from "./helpers";

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
  const { getValues } = useGCFormsContext();

  const formValues: FormValues | void = getValues();

  const reviewItem = getReviewItemFromDynamicRows(formItem, formValues, language);

  if (!reviewItem || !reviewItem.values || !Array.isArray(reviewItem.values)) {
    return <></>;
  }

  return reviewItem.values.map((formItem, index) => {
    const dynamicRowElements = getDynamicRowElements(formItem as FormItem, language);
    return (
      <dl className="my-10" key={`${(formItem as FormItem).element?.id}-${index}`}>
        <h4>{(formItem as FormItem).label}</h4>
        {dynamicRowElements}
      </dl>
    );
  });
};