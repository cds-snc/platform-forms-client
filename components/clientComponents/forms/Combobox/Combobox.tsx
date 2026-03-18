"use client";
import React, { useEffect, useRef } from "react";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

interface ComboboxProps extends InputFieldProps {
  choices?: string[];
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy, lang } = props;
  const classes = cn("gc-combobox gcds-input-wrapper", className);
  const { t } = useTranslation("common", { lng: lang });

  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  // Stored in a ref so stateReducer (called by downshift outside of React's
  // render cycle) always sees the current value without needing it in deps.
  const isIOSRef = useRef(false);

  useEffect(() => {
    // iPadOS 13+ reports as MacIntel but has touch points — check both.
    isIOSRef.current =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1);
  }, []);

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
      stateReducer(state, actionChanges) {
        const { changes, type } = actionChanges;
        // On iOS: keep the list open when the input loses focus. We blur the input
        // intentionally (see useEffect below) to dismiss the virtual keyboard so
        // VoiceOver can swipe to list options. Without this, downshift would close
        // the list the moment the input's blur fires.
        if (isIOSRef.current && type === useCombobox.stateChangeTypes.InputBlur) {
          return { ...changes, isOpen: state.isOpen };
        }
        return changes;
      },
    });

  // iOS VoiceOver cannot navigate a custom combobox listbox while the virtual
  // keyboard is visible: the keyboard physically covers the list and the
  // aria-activedescendant pattern is not announced on iOS VoiceOver.
  //
  // Fix: when the list opens, wait one tick (so the typed character registers)
  // then blur the input to dismiss the keyboard. The list stays open because
  // the stateReducer above suppresses the resulting InputBlur action. VoiceOver
  // users can then swipe right past the live-region status to reach the list
  // options. The input element is found by its id to avoid passing an object
  // ref into a function during render (React 19 compiler restriction).
  useEffect(() => {
    if (!isIOSRef.current || !isOpen) return;
    const timer = setTimeout(() => {
      const inputEl = id ? document.getElementById(id) : null;
      if (inputEl && document.activeElement === inputEl) {
        (inputEl as HTMLInputElement).blur();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen, id]);

  // Compute a status string — updating text inside an always-present node is
  // reliably announced by AT (unlike conditionally inserting a new populated node).
  const statusMessage = isOpen
    ? items.length > 0
      ? t("combobox-results-available", { count: items.length })
      : t("combobox-no-results")
    : "";

  return (
    <>
      <div className={classes} data-testid="combobox">
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        {/* Note: downshift adds and updates the role="combobox" aria-activedescendant relationship with the list below */}
        <input
          {...getInputProps()}
          aria-describedby={ariaDescribedBy}
          id={id}
          required={required}
          {...(name && { name })}
          data-testid="combobox-input"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-labelledby={`label-${id}`}
        />

        {/* Always-present live region: text changes within this node are reliably
            announced by Chrome+VoiceOver and TalkBack, unlike inserting a new node. */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {statusMessage}
        </div>

        {/* The <ul> is always in the DOM so the aria-controls reference on the input
            (set by downshift) is never broken, even when the filtered list is empty.
            tabIndex={-1} makes the listbox programmatically focusable.
            Note: downshift sets role="listbox" on the ul and role="option" on each li. */}
        <ul
          {...getMenuProps()}
          tabIndex={-1}
          data-testid="combobox-listbox"
          hidden={!isOpen || items.length === 0}
          aria-labelledby={`label-${id}`}
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
};
