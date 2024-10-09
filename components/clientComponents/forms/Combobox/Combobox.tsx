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
  onSetValue?: (value: string) => void;
  defaultValue?: string;
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy, defaultValue } = props;
  const classes = classnames("gc-combobox", className);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const [items, setItems] = React.useState(choices);
  const [inputValue, setInputValue] = React.useState(defaultValue || "");

  const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } =
    useCombobox({
      inputValue,
      onInputValueChange({ inputValue }) {
        setInputValue(inputValue || "");
        setItems(
          choices.filter((choice) => {
            return inputValue ? choice.toLowerCase().includes(inputValue.toLowerCase()) : true;
          })
        );
      },
      items,
      onSelectedItemChange({ selectedItem }) {
        if (selectedItem) {
          setValue(selectedItem);
          if (props.onSetValue) {
            props.onSetValue(selectedItem ?? "");
          }
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
