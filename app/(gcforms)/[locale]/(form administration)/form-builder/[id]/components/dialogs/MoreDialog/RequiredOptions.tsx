import { useTranslation } from "@i18n/client";
import { FormElement, ValidationCheckboxLike } from "@lib/types";

export const RequiredOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  // renders for every element type; `all` only applies to checkbox-like ones
  const validation = item.properties.validation as ValidationCheckboxLike | undefined;
  const checked = validation?.required;
  const allRequired = validation?.all;

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("addRules")}</h3>
      </div>
      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          id={`required-${item.id}-id-modal`}
          type="checkbox"
          defaultChecked={checked}
          value={`required-${item.id}-value-modal-` + checked}
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
            } as FormElement);
          }}
        />
        <label
          data-testid="required"
          className="gc-checkbox-label"
          htmlFor={`required-${item.id}-id-modal`}
        >
          <span className="checkbox-label-text">
            {allRequired ? t("allRequired") : t("required")}
          </span>
        </label>
      </div>
    </section>
  );
};
