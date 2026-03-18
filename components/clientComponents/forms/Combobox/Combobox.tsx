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
    // Note that Android TalkBack does not have the same issues and should work as is.
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
    });

  // iOS VoiceOver cannot navigate a custom combobox listbox while the virtual
  // keyboard is visible: the keyboard physically covers the list and the
  // aria-activedescendant pattern is not announced on iOS VoiceOver.
  //
  // Fix: after the user pauses typing, set the input's readOnly DOM property to
  // true. On iOS, this dismisses the virtual keyboard without firing a blur event
  // and without changing document.activeElement — so the input stays focused,
  // downshift keeps the list open, and VoiceOver can swipe right to navigate the
  // list options. When the user taps the input again (onFocus below) or the list
  // closes (isOpen → false), readOnly is reset and the keyboard returns.
  //
  // We mutate the DOM property directly rather than using React state because:
  // 1. An effect mutating a DOM node is "updating an external system" — the
  //    intended use of effects — and avoids the React compiler's cascading-setState
  //    warning that fires when setState is called synchronously in an effect body.
  // 2. No re-render is needed; the browser reacts to readOnly immediately.
  //
  // The debounce works because `items` is a new array reference on every
  // Array.filter() call, so each keystroke cancels and resets the 700ms timer.
  useEffect(() => {
    if (!isIOSRef.current) return;
    const inputEl = id ? (document.getElementById(id) as HTMLInputElement | null) : null;
    if (!inputEl) return;

    if (!isOpen) {
      // List closed (selection made, Escape pressed, etc.) — restore keyboard for next time.
      inputEl.readOnly = false;
      return;
    }

    const timer = setTimeout(() => {
      inputEl.readOnly = true;
    }, 700); // long enough for a comfortable multi-character typing burst
    return () => clearTimeout(timer);
  }, [isOpen, id, items]); // items in deps: new reference on each keystroke, resetting the debounce

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
          {...getInputProps({
            // Reset readOnly on focus — on iOS this restores the keyboard after the
            // user has browsed the list and taps the input again to type more.
            // On other browsers readOnly is never set, so this is always a no-op.
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.readOnly = false;
            },
          })}
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
