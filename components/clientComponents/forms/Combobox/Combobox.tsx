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
        setValue(inputValue);
      },
      items,
      onSelectedItemChange({ selectedItem }) {
        setValue(selectedItem);
      },
      initialInputValue: field.value || "",
    });

  /**
   * aria-lablledby is provided by getInputProps(). Since we're not creating a lablel
   * for the input here, we need to remove it to avoid accessibility issues.
   */
  const inputProps = getInputProps();
  if ("aria-labelledby" in inputProps) {
    delete inputProps["aria-labelledby"];
  }

  return (
    <>
      <div className={classes} data-testid="combobox">
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        {/* Note: downshift adds and updates the role="combobox" aria-activedescendant relationship with the list below */}
        <input
          {...inputProps}
          aria-describedby={ariaDescribedBy}
          id={id}
          required={required}
          {...(name && { name })}
          data-testid="combobox-input"
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />

        {/* Note: downshift adds the role="listbox" and for the LI's below role="option" */}
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
