"use client";
import React from "react";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";

interface ComboboxProps extends InputFieldProps {
  choices?: string[];
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy } = props;
  const classes = cn("gc-combobox gcds-input-wrapper", className);

  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const [items, setItems] = React.useState(choices);
  const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } =
    useCombobox({
      onInputValueChange({ inputValue }) {
        setItems(
          choices.filter((choice) => {
            return inputValue ? choice.toLowerCase().includes(inputValue.toLowerCase()) : true;
          })
        );
      },
      items,
      onSelectedItemChange({ selectedItem }) {
        setValue(selectedItem);
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
          {...(field?.value && { value: field.value || "" })}
          onKeyUp={(e) => {
            // Clear the input on escape. onKeyDown breaks other key interactions, why using onKeyUp
            if (e.key === "Escape") {
              setValue("");
            }
          }}
        />

        {items.length >= 1 && (
          <ul
            className={`${!(isOpen && items.length >= 1 && items[0] !== "") ? "hidden" : ""}`}
            {...getMenuProps()}
            data-testid="combobox-listbox"
            hidden={!isOpen}
          >
            {isOpen &&
              items.length >= 1 &&
              items.map((item, index) => (
                <li
                  className={cn(
                    highlightedIndex === index && "bg-gcds-blue-100",
                    selectedItem === item && "font-bold"
                  )}
                  key={item}
                  {...getItemProps({ item, index })}
                >
                  {item}
                </li>
              ))}
          </ul>
        )}
      </div>
    </>
  );
};
