"use client";
import React, { useState, useImperativeHandle, useEffect } from "react";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

export interface ManagedComboboxProps extends InputFieldProps {
  choices?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetValue?: (value: string) => void;
  baseValue?: string;
  useFilter?: boolean;
  placeholderText?: string;
  overrideError?: string | null;
  maxLength?: number;
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
      overrideError,
      maxLength,
    } = props;
    const classes = cn("gc-combobox gcds-input-wrapper relative", className);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;
    const hasError = Boolean(overrideError || meta.error);
    const errorMessageId = getErrorMessageId(id);
    const describedByIds = getDescribedByIds(
      hasError ? errorMessageId : undefined,
      ariaDescribedBy
    );

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
          if (!useFilter) {
            setIsOpen(true);
          }
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

    const performChangeInputValue = (value: string, keepOpen: boolean) => {
      if (!keepOpen) {
        // Don't replace the value if we want to keep the dropdown open
        setInputValue(value);
      }
      setIsOpen(keepOpen);
    };

    // Use useImperativeHandle to expose the method
    useImperativeHandle(ref, () => ({
      changeInputValue: (value: string, keepOpen: boolean) =>
        performChangeInputValue(value, keepOpen),
    }));

    const inputProps = getInputProps({
      id,
      name,
      maxLength,
      "aria-required": required ? "true" : undefined,
      "aria-invalid": hasError ? "true" : undefined,
      "aria-describedby": describedByIds,
      onFocus: () => setIsOpen(true),
      onBlur: () => setIsOpen(false),
      onChange: (e) => {
        setInputValue((e.target as HTMLInputElement).value);
      },
      // Prevents a double input refresh from being fired, this is a workaround for a downshift bug
      // https://github.com/downshift-js/downshift/issues/1108
      // Downshift won't be updated to fix this issue, so we need to handle it ourselves
    });
    // Use the for-id label-input association over aria-labeledby but downshift only allows nulling it.
    // That keeps an empty `aria-labelledby=""`, not ideal. So just delete the property manually..
    delete inputProps["aria-labelledby"];

    return (
      <div className={classes} data-testid="combobox">
        {hasError && <ErrorMessage id={errorMessageId}>{overrideError ?? meta.error}</ErrorMessage>}

        <input {...inputProps} data-testid="combobox-input" placeholder={placeholderText} />

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
