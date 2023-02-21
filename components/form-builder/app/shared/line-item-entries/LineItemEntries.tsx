import React, { useEffect, useRef } from "react";
import { LineItems } from "./LineItems";
import { scrollToBottom } from "@lib/uiUtils";
import { useTranslation } from "react-i18next";

// Note: updates are done in a DIV live region to have more control and reduce the verbosity of
// what's announced -vs- just adding a live region on the OL which works but is painfully verbose.

export const LineItemEntries = ({
  inputs,
  setInputs,
  validateInput,
  inputLabelId,
  maxEntries = 20,
}: {
  inputs: string[];
  setInputs: (tag: string[]) => void;
  validateInput?: (tag: string) => boolean;
  spellCheck?: boolean;
  inputLabelId: string;
  maxEntries?: number;
}) => {
  const { t } = useTranslation("form-builder");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const onRemove = (text: string) => {
    setInputs(inputs.filter((input) => input !== text));
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${t("responses.dialogMessages.removed")} ${text}`;
    }
    inputRef.current?.focus();
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");

    if (!text && inputs.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${inputs.at(-1)}`;
      setInputs([...new Set(inputs.slice(0, -1))]);
    }

    if (text && ["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      if ((validateInput && !validateInput(text)) || inputs.length >= maxEntries) {
        return;
      }
      setInputs([...new Set([...inputs, text])]);
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${t("responses.dialogMessages.added")} ${text}`;
      }
      (e.target as HTMLInputElement).value = "";
    }
  };

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
        <LineItems values={inputs} onRemove={onRemove} />
      </ol>
      <div className="grow p-4">
        <input
          ref={inputRef}
          data-testid="value-input"
          className="w-full border-none p-1 outline-none"
          type="text"
          name="value-input"
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          spellCheck="false"
          autoComplete="false"
          aria-labelledby={inputLabelId}
        />
      </div>
      {inputs.length >= maxEntries && (
        <div role="alert" className="px-4 py-2 m-2 bg-[#dcd6fe]">
          <p className="font-bold">
            {t("responses.dialogMessages.onlyMaxResponses", { max: maxEntries })}
          </p>
          <p>{t("responses.dialogMessages.reportTheseForm")}</p>
        </div>
      )}
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
