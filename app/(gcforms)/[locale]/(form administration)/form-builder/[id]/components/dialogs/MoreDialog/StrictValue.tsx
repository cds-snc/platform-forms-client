import { useTranslation } from "@i18n/client";
import { Checkbox } from "@formBuilder/components/shared/MultipleChoice";
import { FormElement } from "@lib/types";

export const StrictValue = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const checked = item.properties.strictValue;

  if (item.type !== "combobox") {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("strictValue.title")}</h3>
      </div>
      <div>
        <Checkbox
          data-testid="strictValue"
          id={`required-${item.id}-id-modal`}
          value={`required-${item.id}-value-modal-` + checked}
          key={`required-${item.id}-modal-` + checked}
          defaultChecked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                strictValue: e.target.checked,
              },
            });
          }}
          label={t("strictValue.label")}
        ></Checkbox>
      </div>
    </section>
  );
};
