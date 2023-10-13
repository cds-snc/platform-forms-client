import React from "react";
import { cn } from "@lib/utils";

import { BrandingIcon } from "@formbuilder/icons";

type Option = {
  value: string;
  label: string;
};

export const Logos = ({
  className,
  selected,
  options,
  disabled,
  handleUpdate,
  ...rest
}: {
  className?: string;
  selected: string;
  options: Option[];
  disabled: boolean;
  handleUpdate: (type: string) => void;
}) => {
  return (
    <div>
      <BrandingIcon className="mr-2 inline-block" />
      <select
        disabled={disabled}
        id="branding-select"
        value={selected}
        className={cn("form-builder-dropdown mb-0 mt-0 inline-block text-black-default", className)}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
          const val = evt.target.value;
          handleUpdate(val);
        }}
        {...rest}
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
