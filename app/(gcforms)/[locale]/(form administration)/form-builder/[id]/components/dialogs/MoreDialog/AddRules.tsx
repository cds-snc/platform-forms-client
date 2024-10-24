import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Checkbox } from "@formBuilder/components/shared";

export const AddRules = ({
  item,
  setItem,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const checked = item.properties.validation?.required;
  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("addRules")}</h3>
      </div>
      <div>
        <Checkbox
          id={`required-${item.index}-id-modal`}
          value={`required-${item.index}-value-modal-` + checked}
          key={`required-${item.index}-modal-` + checked}
          defaultChecked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // clone the existing properties so that we don't overwrite other keys in "validation"
            const validation = Object.assign({}, item.properties.validation, {
              required: e.target.checked,
            });
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ validation },
              },
            });
          }}
          label={t("required")}
        ></Checkbox>
      </div>
    </section>
  );
};
