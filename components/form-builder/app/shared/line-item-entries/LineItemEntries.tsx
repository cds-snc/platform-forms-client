import React from "react";

import { LineItems } from "./LineItems";
import { LineInput } from "./LineInput";

export const LineItemEntries = ({
  inputs,
  setInputs,
  validateInput,
  spellCheck = true,
  inputLabelId,
}: {
  inputs: string[];
  setInputs: (tag: string[]) => void;
  validateInput?: (tag: string) => boolean;
  spellCheck?: boolean;
  inputLabelId: string;
}) => {
  const onRemove = (text: string) => {
    setInputs(inputs.filter((input) => input !== text));
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
      if (validateInput && !validateInput(text)) return;

      setInputs([...new Set([...inputs, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  const onBlur = (e: { target: HTMLInputElement }) => {
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");

    if (validateInput && !validateInput(text)) return;

    if (text) {
      setInputs([...new Set([...inputs, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  // TODO: accessibility - look into why removals are not being announced in VoiceOver..
  return (
    <ol
      className="rounded-md box-border border-black-default border-2 py-3"
      data-testid="values"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="text removals"
    >
      <LineItems values={inputs} onRemove={onRemove} />
      <LineInput
        onKeyUp={onKeyUp}
        onBlur={onBlur}
        spellCheck={spellCheck}
        inputLabelId={inputLabelId}
      />
    </ol>
  );
};
