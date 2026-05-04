import React, { useId } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

type Choice = {
  label: string;
  value: string;
};

export const ChoiceSelect = ({
  selected,
  choices,
  onChange,
  className,
  addCatchAll,
}: {
  selected: string | null;
  choices: Choice[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  addCatchAll?: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const labelId = `choice-select-${useId()}`;

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  // Get the parent question of the next action choice
  const choiceParentQuestion = selected?.split(".")[0] || null;

  // Keep the saved catch-all option selectable after reloads.
  if (addCatchAll || selected?.includes("catch-all")) {
    choices = [
      {
        label: t("logic.choiceSelect.selectOption"),
        value: "",
      },
      {
        label: t("logic.choiceSelect.catchAllOption"),
        value: `${choiceParentQuestion}.catch-all`,
      },
      ...choices,
    ];
  }

  if (!choices.length) {
    return null;
  }

  return (
    <div className="my-2 flex flex-col pt-4">
      <label className="mb-2 inline-block text-sm" id={labelId}>
        {t("addConditionalRules.optionTitle")}
      </label>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px form-builder-dropdown text-black-default my-0 inline-block w-93.75 border-1 border-black p-2 text-sm",
          className
        )}
        aria-labelledby={labelId}
      >
        {choices.map(({ label, value }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};
