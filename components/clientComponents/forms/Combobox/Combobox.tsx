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

  // Follow the Gov.uk (bump) pattern of two alternating live regions to ensure a duplicate
  // update is still announced by AT. (usually ignored by default)
  const [bump, setBump] = useState(false);
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
      // Suppress downshift's built-in live region so we can customize announcements and
      // timing for better AT support
      getA11yStatusMessage: () => "",
    });

  // Add some workarounds for onscreen keyboards: 400ms for no-results (query obviously done),
  // 1400ms otherwise to avoid mid-keystroke noise when typing quickly. These are based on
  // testing with iOS Safari+VoiceOver and may need adjustment for other AT/browser combos.
  const announcementDelay = isOpen && items.length === 0 ? 400 : 1400;

  // Announce either a) the option item count when results are available, or b) a no-results
  // message when the list is empty.
  const targetMessage = isOpen
    ? items.length > 0
      ? t("combobox-results-available", { count: items.length })
      : t("combobox-no-results")
    : "";

  // Announce while a user is typing BUT stop duplicate announcements by:
  // 1) Clearing any pending announcement whenever the input changes (debounce pattern).
  // 2) Skipping the announcement entirely when the list first opens, since AT should
  //    already be announcing that via aria-expanded.
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

        {/* Keyboard/touch instructions for AT users, always rendered alongside any passed description. */}
        <span id={`${id}-hint`} className="sr-only">
          {t("combobox-input-hint")}
        </span>

        {/* downshift manages role="combobox", aria-activedescendant, and aria-expanded */}
        <input
          {...getInputProps()}
          aria-describedby={`${ariaDescribedBy} ${id}-hint`}
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

        {/* Dual alternating live regions (GOV.UK bump pattern) to ensure AT announce every update 
            even when the message text repeats */}
        <div id={`${id}-live-a`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? announcedMessage : ""}
        </div>
        <div id={`${id}-live-b`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? "" : announcedMessage}
        </div>

        {/* Ensure UL remains in the DOM so the aria-controls reference is never broken.
            Note: downshift sets role="listbox"/"option". */}
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
                data-value={item}
                className={cn(
                  "min-h-[44px]",
                  highlightedIndex === index && "bg-gcds-blue-100",
                  selectedItem === item && "font-bold"
                )}
                key={item}
                {...getItemProps({ item, index })}
                onMouseDown={(e) => {
                  // Prevent Safari blur firing before click, which closes the list early.
                  e.preventDefault();
                }}
              >
                {item}
                {/* iOS VoiceOver doesn't reliably read aria-posinset/setsize. Inline position 
                    text as fallback. This technique was taken from GOV.UK accessible-autocomplete
                    and I don't fully understand it :) */}
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
