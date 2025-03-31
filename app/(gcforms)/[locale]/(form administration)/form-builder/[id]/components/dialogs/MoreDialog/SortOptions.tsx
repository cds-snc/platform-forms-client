import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";
import { Label } from "./Label";

export const SortOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const sortOptions = [
    { value: "none", label: t("sortOptions.none") },
    { value: "ascending", label: t("sortOptions.ascending") },
    { value: "descending", label: t("sortOptions.descending") },
  ];

  if (item.type !== "dropdown") {
    return null;
  }

  return (
    <section className="mb-4">
      <Label htmlFor={`sort--modal--${item.id}`}>{t("sortOptions.label")}</Label>
      <div className="gcds-select-wrapper">
        <select
          data-testid="autocomplete"
          className="gc-dropdown mb-4 inline-block"
          id={`sort--modal--${item.id}`}
          value={item.properties.sortOrder || ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ sortOrder: e.target.value },
              },
            });
          }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};
