import { FormValues } from "@lib/formContext";
import { FormItem } from "../../helpers";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormItemFactory } from "../../FormItemFactory";
import { Language } from "@lib/types/form-builder-types";
import { randomId } from "@lib/client/clientHelpers";
import { getReviewSectionFromDynamicRows } from "./helpers";
import { useTranslation } from "@i18n/client";

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
  const { t } = useTranslation(["review"]);
  const { getValues } = useGCFormsContext();

  const formValues: FormValues | void = getValues();
  const reviewSection = getReviewSectionFromDynamicRows(formItem, formValues, language);
  if (!Array.isArray(reviewSection?.values)) {
    return <></>;
  }

  return (
    <div>
      <h4>{(formItem as FormItem).label}</h4>
      {reviewSection.values.map((formItem, index) => {
        const dynamicRowElements = getDynamicRowElements(formItem as FormItem, language);
        return (
          <dl className="mt-12 mb-10" key={`${(formItem as FormItem).element?.id}-${index}`}>
            <h5 className="mb-8">{t("instance", { index: index + 1 })}</h5>
            {dynamicRowElements}
          </dl>
        );
      })}
    </div>
  );
};
