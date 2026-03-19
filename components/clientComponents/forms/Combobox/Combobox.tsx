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

  // GOV.UK "bump" pattern for dual live regions.
  // Two alternating aria-live containers are used because some AT only announce
  // a live region when the DOM node's text content changes. If the same status
  // string is written twice in a row to the same element, no change fires and
  // the AT stays silent. Alternating between two elements guarantees a DOM
  // mutation every time, regardless of whether the message text changed.
  // The update is debounced at 1400ms (matching GOV.UK) so mid-keystroke
  // intermediate counts are not announced while the user is still typing.
  const [bump, setBump] = useState(false);
  // announcedMessage is updated together with bump in the same setTimeout callback
  // so the live regions only ever change once per debounced cycle. If targetMessage
  // were used directly in the JSX, changing it would trigger an immediate AT
  // announcement, and then the bump flip would trigger a second one.
  const [announcedMessage, setAnnouncedMessage] = useState("");
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
      // Suppress downshift's built-in live region announcements. The custom
      // dual bump regions below handle all status messaging, so allowing
      // downshift's region to also announce would cause double-announcements.
      getA11yStatusMessage: () => "",
    });

  // Announce "no results" faster (400ms) — the user has clearly finished a query
  // that matched nothing. Use 1400ms for result counts to avoid mid-keystroke noise
  // (mirrors GOV.UK). Both values are derived here so the useEffect dep is explicit.
  const announcementDelay = isOpen && items.length === 0 ? 400 : 1400;

  // Build the status string: result count only.
  // The highlighted item is intentionally excluded — VoiceOver announces the
  // focused option via aria-activedescendant, and the visually-hidden position
  // span inside each <li> covers iOS VoiceOver swipe. Including the item here
  // caused a double-announcement on every arrow-key navigation. Excluding it
  // also means targetMessage doesn't change during navigation, so the live
  // region stays silent and only fires when the filtered count actually changes.
  const targetMessage = isOpen
    ? items.length > 0
      ? t("combobox-results-available", { count: items.length })
      : t("combobox-no-results")
    : "";

  // Single effect manages all bump scheduling so there is never more than one
  // pending timer at a time (two competing effects would each fire a bump,
  // causing double-announcements when the list first opens).
  //
  // When the list transitions from closed → open, skip the bump entirely.
  // VoiceOver natively announces the aria-expanded state change on the input,
  // so firing the live region at the same time causes a double-announcement.
  // The live region is only needed for typing/navigation feedback after open.
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (justOpened) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAnnouncedMessage(targetMessage);
      setBump((b) => !b);
    }, announcementDelay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [targetMessage, announcementDelay, isOpen]);

  return (
    <>
      <div className={classes} data-testid="combobox" {...(lang && { lang })}>
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        {/* Note: downshift adds and updates the role="combobox" aria-activedescendant 
            relationship with the list below. Downshift also adds+manages aria-expanded */}
        <input
          {...getInputProps()}
          aria-describedby={ariaDescribedBy}
          id={id}
          required={required}
          aria-required={required}
          {...(name && { name })}
          data-testid="combobox-input"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-labelledby={`label-${id}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />

        {/* GOV.UK dual alternating live regions ("bump" pattern).
            One element always holds the current message, the other is empty.
            On each debounced update bump flips, swapping which element is
            populated — guaranteeing a DOM text-change that AT will announce
            even when the message string itself hasn't changed. */}
        <div id={`${id}-live-a`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? announcedMessage : ""}
        </div>
        <div id={`${id}-live-b`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? "" : announcedMessage}
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
                  "min-h-[44px]",
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
                {/* iOS VoiceOver and some mobile AT do not reliably announce
                    aria-posinset/aria-setsize on listbox options. A visually-hidden
                    span with the position text ensures VoiceOver reads it directly.
                    Inspired by GOV.UK accessible-autocomplete. Always rendered so
                    React 19 SSR hydration stays consistent. */}
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
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
