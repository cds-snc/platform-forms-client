import React from "react";
export const LineInput = ({
  onKeyUp,
  onBlur,
  // Allow setting to false for use cases like a UUID or email. Most browsers will probably set this
  // to true by default. more info https://html.spec.whatwg.org/#spelling-and-grammar-checking
  spellCheck,
  inputLabelId,
}: {
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: { target: HTMLInputElement }) => void;
  spellCheck?: boolean;
  inputLabelId: string;
}) => {
  return (
    <div className="grow pl-6 pr-4">
      <input
        data-testid="value-input"
        className="w-full border-none p-1 outline-none"
        type="text"
        name="value-input"
        onKeyUp={onKeyUp && onKeyUp}
        onBlur={onBlur && onBlur}
        {...(!spellCheck && { spellCheck: "false" })}
        aria-labelledby={inputLabelId}
      />
    </div>
  );
};
