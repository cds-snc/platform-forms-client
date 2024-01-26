import React from "react";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";

import { cn } from "@lib/utils";

interface ComboboxProps extends InputFieldProps {
  children?: React.ReactElement;
  choices?: string[];
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { children, id, name, className, choices = [], required, ariaDescribedBy } = props;
  const classes = classnames("gc-combobox", className);
  const [field, meta] = useField(props);

  const [items, setItems] = React.useState(choices);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      setItems(
        choices.filter((choice) => (inputValue ? choice.includes(inputValue.toLowerCase()) : true))
      );
    },
    items,
    itemToString(item) {
      return item ? item : "";
    },
  });

  return (
    <>
      <div className="gc-combobox">
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        <input placeholder="Best book ever" className="w-full p-1.5" {...getInputProps()} />

        <ul className={`${!(isOpen && items.length) && "hidden"}`} {...getMenuProps()}>
          {isOpen &&
            items.map((item, index) => (
              <li
                className={cn(
                  highlightedIndex === index && "bg-slate-300",
                  selectedItem === item && "font-bold"
                )}
                key={item}
                {...getItemProps({ item, index })}
              >
                <span>{item}</span>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
