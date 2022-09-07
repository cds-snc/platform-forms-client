import React, { useState } from "react";
import useTemplateStore from "../store/useTemplateStore";

export const CopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState("");
  const { getSerializedSchema } = useTemplateStore();

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = getSerializedSchema();

      await navigator.clipboard.writeText(stringified);
      setIsCopied("(template copied)");
    }
  };

  return (
    <>
      <button className="button" onClick={handleCopyToClipboard}>
        Copy to clipboard
      </button>
      {` ${isCopied}`}
    </>
  );
};
