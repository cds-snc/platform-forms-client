import { useTranslation } from "@i18n/client";
import { Checkbox } from "@formBuilder/components/shared/MultipleChoice";
import { FormElement } from "@lib/types";

export const RequiredOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const checked = item.properties.validation?.required;
  const allRequired = item.properties.validation?.all;

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("addRules")}</h3>
      </div>
      <div>
        <Checkbox
          data-testid="required"
          id={`required-${item.id}-id-modal`}
          value={`required-${item.id}-value-modal-` + checked}
          key={`required-${item.id}-modal-` + checked}
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
          label={allRequired ? t("allRequired") : t("required")}
          disabled={item.properties.validation?.all}
        ></Checkbox>
      </div>
    </section>
  );
};
