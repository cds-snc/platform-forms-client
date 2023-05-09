import React from "react";

type Option = {
  value: string;
  label: string;
};

export const Logos = ({
  selected,
  options,
  disabled,
  handleUpdate,
}: {
  selected: string;
  options: Option[];
  disabled: boolean;
  handleUpdate: (type: string) => void;
}) => {
  return (
    <div>
      <select
        disabled={disabled}
        id="branding-select"
        value={selected}
        className="gc-dropdown inline-block mb-5 text-black-default"
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
          const val = evt.target.value;
          handleUpdate(val);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
