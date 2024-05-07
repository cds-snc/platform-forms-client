import { cn } from "@lib/utils";

type GroupItem = {
  label: string;
  value: string;
};

export const GroupSelect = ({
  selected,
  groups,
  onChange,
  className,
}: {
  selected: string | null;
  groups: GroupItem[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const labelId = `section-select-${Date.now()}`;

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm" id={labelId}>
        Go to section
      </label>
      <select
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[375px] text-black-default text-sm",
          className
        )}
        aria-labelledby={labelId}
      >
        {groups.map(({ label, value }, i) => {
          return (
            <option key={`${value}-${i}`} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};
