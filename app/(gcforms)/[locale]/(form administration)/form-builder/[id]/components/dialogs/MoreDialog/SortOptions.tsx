import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";
import { SortOption, SortValue } from "@gcforms/types";
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
    { value: SortOption.NONE, label: t("sortOptions.none") },
    { value: SortOption.ASCENDING, label: t("sortOptions.ascending") },
    { value: SortOption.DESCENDING, label: t("sortOptions.descending") },
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
            const selectedOption = sortOptions.find((option) => option.value === e.target.value);

            if (!selectedOption) {
              return;
            }

            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ sortOrder: selectedOption.value as SortValue },
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
