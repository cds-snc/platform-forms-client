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
      <h4 className="mb-2" id={labelId}>
        Go to section
      </h4>
      <select
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
          className
        )}
        aria-labelledby={labelId}
      >
        {groups.map(({ label, value }) => {
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
