"use client";
import React, { useState, useImperativeHandle } from "react";
import { InputFieldProps } from "@lib/types";
import classnames from "classnames";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";

interface ManagedComboboxProps extends InputFieldProps {
  choices?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetValue?: (value: string) => void;
  baseValue?: string;
  useFilter?: boolean;
}

export const ManagedCombobox = React.forwardRef(
  (props: ManagedComboboxProps, ref): React.ReactElement => {
    const {
      id,
      name,
      className,
      choices = [],
      required,
      ariaDescribedBy,
      baseValue,
      useFilter,
    } = props;
    const classes = classnames("gc-combobox gcds-input-wrapper relative", className);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;

    const [isOpen, setIsOpen] = useState(false); // State to control isOpen

    const [items, setItems] = React.useState(choices);
    const [inputValue, setInputValue] = React.useState(baseValue || "");

    const { getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem, openMenu } =
      useCombobox({
        inputValue,
        onInputValueChange({ inputValue }) {
          setInputValue(inputValue || "");
          if (props.onChange) {
            props.onChange({
              target: { value: inputValue },
            } as React.ChangeEvent<HTMLInputElement>);
          }
          setItems(
            choices.filter((choice) => {
              if (useFilter) {
                return inputValue ? choice.toLowerCase().includes(inputValue.toLowerCase()) : true;
              } else {
                return true; // API pre-filtered choices.
              }
            })
          );

          // Active refresh for all managed combobox.
          openMenu();
          setIsOpen(true);
        },
        items,
        onSelectedItemChange({ selectedItem }) {
          setValue(selectedItem);

          if (props.onSetValue) {
            props.onSetValue(selectedItem ?? "");
          }

          setIsOpen(false);
        },
        onIsOpenChange: ({ isOpen }) => {
          setIsOpen(isOpen ?? false);
        },
      });

    const changeInputValue = (value: string) => {
      setInputValue(value);
    };

    // Use useImperativeHandle to expose the method
    useImperativeHandle(ref, () => ({
      changeInputValue,
    }));

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
        </div>
      </>
    );
  }
);

ManagedCombobox.displayName = "ManagedCombobox";
