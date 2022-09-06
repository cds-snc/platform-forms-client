import React, { useState } from "react";
import { useGetTemplate } from "../hooks/useGetTemplate";

export const CopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState("");
  const { schema } = useGetTemplate();

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = JSON.stringify(schema, null, 2);
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
