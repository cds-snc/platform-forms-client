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
  const labelId = `choice-select-${Date.now()}`;

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  // Get the parent question of the next action choice
  const choiceParentQuestion = selected?.split(".")[0] || null;

  if (addCatchAll) {
    choices = [
      {
        label: "Select an option",
        value: "",
      },
      {
        label: `Catch all (any other value)`,
        value: `${choiceParentQuestion}.catch-all`,
      },
      ...choices,
    ];
  }

  return (
    <div className="my-2 flex flex-col">
      <label className="mb-2 inline-block text-sm" id={labelId}>
        {t("addConditionalRules.optionTitle")}
      </label>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[375px] text-black-default text-sm",
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
