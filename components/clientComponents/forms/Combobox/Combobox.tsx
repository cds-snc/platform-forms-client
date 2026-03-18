"use client";
import React, { useEffect, useRef, useState } from "react";
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

  // Whether the current device is iOS — used for the aria-posinset workaround below.
  // Stored in a ref so it is set once after mount and never causes renders.
  const isIOSRef = useRef(false);
  useEffect(() => {
    isIOSRef.current =
      typeof navigator !== "undefined" &&
      !!(
        navigator.userAgent.match(/(iPod|iPhone|iPad)/g) &&
        navigator.userAgent.match(/AppleWebKit/g)
      );
  }, []);

  // GOV.UK "bump" pattern for dual live regions.
  // Two alternating aria-live containers are used because some AT only announce
  // a live region when the DOM node's text content changes. If the same status
  // string is written twice in a row to the same element, no change fires and
  // the AT stays silent. Alternating between two elements guarantees a DOM
  // mutation every time, regardless of whether the message text changed.
  // The update is debounced at 1400ms (matching GOV.UK) so mid-keystroke
  // intermediate counts are not announced while the user is still typing.
  const [bump, setBump] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Build the status string. Mirrors GOV.UK's tResults: count + highlighted item.
  // "3 options available. Treasury Board of Canada Secretariat, 1 of 3"
  const highlightedItem = highlightedIndex >= 0 ? items[highlightedIndex] : null;
  const highlightedSuffix =
    highlightedItem !== null && highlightedItem !== undefined
      ? ` ${t("combobox-option-highlighted", {
          option: highlightedItem,
          index: highlightedIndex + 1,
          total: items.length,
        })}`
      : "";
  const targetMessage = isOpen
    ? items.length > 0
      ? `${t("combobox-results-available", { count: items.length })}${highlightedSuffix}`
      : t("combobox-no-results")
    : "";

  // Debounce the bump flip: clears any pending timer on each render, then
  // sets a new one. The bump state flip triggers a re-render that moves
  // targetMessage into whichever live region is currently empty.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setBump((b) => !b), 1400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMessage]);

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

        {/* GOV.UK dual alternating live regions ("bump" pattern).
            One element always holds the current message, the other is empty.
            On each debounced update bump flips, swapping which element is
            populated — guaranteeing a DOM text-change that AT will announce
            even when the message string itself hasn't changed. */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? targetMessage : ""}
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? "" : targetMessage}
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
                onMouseDown={(e) => {
                  // Safari fires blur on the input before click fires on the option,
                  // which closes the list before the selection is registered.
                  // preventDefault here stops that blur from happening.
                  e.preventDefault();
                }}
              >
                {item}
                {/* iOS VoiceOver does not reliably announce aria-posinset /
                    aria-setsize on listbox options. A visually-hidden text node
                    with the position gives VoiceOver something to read directly.
                    Technique from GOV.UK accessible-autocomplete. */}
                {isIOSRef.current && (
                  <span
                    style={{
                      border: 0,
                      clip: "rect(0 0 0 0)",
                      height: "1px",
                      marginBottom: "-1px",
                      marginRight: "-1px",
                      overflow: "hidden",
                      padding: 0,
                      position: "absolute",
                      whiteSpace: "nowrap",
                      width: "1px",
                    }}
                  >
                    {` ${index + 1} ${t("combobox-of")} ${items.length}`}
                  </span>
                )}
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
