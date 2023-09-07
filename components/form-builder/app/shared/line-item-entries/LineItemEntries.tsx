import React, { useEffect, useRef } from "react";
import { LineItems } from "./LineItems";
import { scrollToBottom } from "@lib/clientHelpers";
import { useTranslation } from "react-i18next";
import { DialogStates } from "../../responses/DownloadTableDialogConfirm";

// TODO: handle duplicate entries?
// TODO: should "backspace" on an empty input set the next entry into "edit mode"?
// TODO: allow a comma separated list of codes to be pasted in?

// Note: updates are done in a DIV live region to have more control and reduce the verbosity of
// what's announced -vs- just adding a live region on the OL which works but is painfully verbose.

export const LineItemEntries = ({
  inputs,
  setInputs,
  validateInput,
  inputLabelId,
  maxEntries = 20,
  errorEntriesList,
  status,
  setStatus,
}: {
  inputs: string[];
  setInputs: (tag: string[]) => void;
  validateInput?: (tag: string) => boolean;
  spellCheck?: boolean;
  inputLabelId: string;
  maxEntries?: number;
  errorEntriesList: string[];
  status: DialogStates;
  setStatus: React.Dispatch<React.SetStateAction<DialogStates>>;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const onRemove = (text: string) => {
    setInputs(inputs.filter((input) => input !== text));
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${t(
        "downloadResponsesModals.lineItemEntries.removed"
      )} ${text}`;
    }
    inputRef.current?.focus();
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    // Since the API only accepts lowercase UUID/FormId help the user out by ensuring lower case
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "").toLowerCase();

    // Reset any errors on an empty list
    if (!text && (status === DialogStates.MAX_ERROR || status === DialogStates.FORMAT_ERROR)) {
      setStatus(DialogStates.EDITTING);
    }

    // Backspace on an empty input sets the previous entry into "edit mode"
    if (!text && inputs.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${inputs.at(-1)}`;
      setInputs([...new Set(inputs.slice(0, -1))]);
    }

    // Enter or Space tries to add the entry
    if (text && ["Enter", " "].includes(e.key)) {
      e.preventDefault();

      if (validateInput && !validateInput(text)) {
        setStatus(DialogStates.FORMAT_ERROR);
        return;
      }

      if (inputs.length >= maxEntries) {
        setStatus(DialogStates.MAX_ERROR);
        return;
      }

      // Add and announce entry
      setInputs([...new Set([...inputs, text])]);
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${t(
          "downloadResponsesModals.lineItemEntries.added"
        )} ${text}`;
      }

      // Reset
      setStatus(DialogStates.EDITTING);
      (e.target as HTMLInputElement).value = "";
    }
  };

  // TODO: add entry error checking and showing errors here also?
  const onBlur = (e: { target: HTMLInputElement }) => {
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");
    if ((validateInput && !validateInput(text)) || inputs.length >= maxEntries) {
      return;
    }
    if (text) {
      setInputs([...new Set([...inputs, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  useEffect(() => {
    scrollToBottom(containerRef?.current as HTMLElement);
  }, [inputs]);

  return (
    <div
      ref={containerRef}
      className="max-h-60 overflow-y-auto box-border border-black-default border-2 rounded-md"
    >
      <ol data-testid="values">
        <LineItems values={inputs} onRemove={onRemove} errorEntriesList={errorEntriesList} />
      </ol>
      <div className="grow p-4">
        <input
          ref={inputRef}
          data-testid="value-input"
          className={
            "w-full p-1 outline-none " +
            (inputs.length > 0 ? "border-2 border-dashed border-grey" : "border-none")
          }
          type="text"
          name="value-input"
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          spellCheck="false"
          autoComplete="off"
          aria-labelledby={inputLabelId}
        />
      </div>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="false"
        // aria-relevant="text additions" -- Note: default
      ></div>
    </div>
  );
};
