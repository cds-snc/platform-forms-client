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
}: {
  selected: string | null;
  choices: Choice[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const labelId = `choice-select-${Date.now()}`;

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  return (
    <div className="my-4 mr-4 flex flex-col">
      <div className="mb-2">
        <h4 className="mb-2" id={labelId}>
          {t("addConditionalRules.optionTitle")}
        </h4>
      </div>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
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
