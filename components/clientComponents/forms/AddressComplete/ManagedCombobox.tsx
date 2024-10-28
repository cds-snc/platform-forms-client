"use client";
import React, { useState, useImperativeHandle, useEffect } from "react";
import { InputFieldProps } from "@lib/types";
import { cn } from "@lib/utils";
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
  placeholderText?: string;
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
      baseValue = "",
      useFilter = true,
      placeholderText = "",
    } = props;
    const classes = cn("gc-combobox gcds-input-wrapper relative", className);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;

    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState(choices);
    const [inputValue, setInputValue] = useState(baseValue);

    useEffect(() => {
      setItems(choices);
    }, [choices]);

    const { getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } =
      useCombobox({
        inputValue,
        onInputValueChange: ({ inputValue }) => {
          setInputValue(inputValue || "");
          if (props.onChange) {
            props.onChange({
              target: { value: inputValue },
            } as React.ChangeEvent<HTMLInputElement>);
          }
          setItems(
            choices.filter((choice) =>
              useFilter ? choice.toLowerCase().includes(inputValue?.toLowerCase() || "") : true
            )
          );
          setIsOpen(true);
        },
        items,
        onSelectedItemChange: ({ selectedItem }) => {
          setValue(selectedItem || "");
          if (props.onSetValue) {
            props.onSetValue(selectedItem || "");
          }
          setIsOpen(false);
        },
        onIsOpenChange: ({ isOpen }) => {
          setIsOpen(isOpen ?? false);
        },
      });

    const performChangeInputValue = (value: string) => {
      setInputValue(value);
      setIsOpen(false);
    };

    // Use useImperativeHandle to expose the method
    useImperativeHandle(ref, () => ({
      changeInputValue: (value: string) => performChangeInputValue(value),
    }));

    return (
      <div className={classes} data-testid="combobox">
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        <input
          {...getInputProps({
            id,
            name,
            required,
            "aria-describedby": ariaDescribedBy,
            onFocus: () => setIsOpen(true),
          })}
          data-testid="combobox-input"
          placeholder={placeholderText}
        />

        <ul
          className={cn({ hidden: !isOpen || items.length === 0 })}
          {...getMenuProps()}
          data-testid="combobox-listbox"
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
    );
  }
);

ManagedCombobox.displayName = "ManagedCombobox";
