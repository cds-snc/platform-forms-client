"use client";
import React from "react";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";

interface ComboboxProps extends InputFieldProps {
  choices?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetValue?: (value: string) => void;
  activeRefresh?: boolean;
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy } = props;
  const classes = classnames("gc-combobox", className);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const [items, setItems] = React.useState(choices);
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    openMenu,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      if (props.onChange) {
        props.onChange({ target: { value: inputValue } } as React.ChangeEvent<HTMLInputElement>);
      }
      setItems(
        choices.filter((choice) => {
          return inputValue ? choice.toLowerCase().includes(inputValue.toLowerCase()) : true;
        })
      );
      if (props.activeRefresh) {
        openMenu();
      }
    },
    items,
    onSelectedItemChange({ selectedItem }) {
      setValue(selectedItem);

      if (props.onSetValue) {
        props.onSetValue(selectedItem ?? "");
      }
    },
  });

  return (
    <>
      <div className={classes} data-testid="combobox">
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        <input
          {...getInputProps()}
          aria-describedby={ariaDescribedBy}
          id={id}
          required={required}
          {...(name && { name })}
          data-testid="combobox-input"
        />

        <ul
          className={`${!(isOpen && items.length) ? "hidden" : ""}`}
          {...getMenuProps()}
          data-testid="combobox-listbox"
          hidden={!isOpen}
        >
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
                {item}
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
