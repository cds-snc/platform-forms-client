import React, { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../store/useTemplateStore";
import { Button } from "../shared/Button";

interface IShowSpan {
  show: boolean;
}

const StyledSpan = styled.span<IShowSpan>`
  color: #777777;
  margin-left: 1rem;
  transition: 500ms all ease;
  opacity: ${(props) => (props.show ? "1" : "0")};
  will-change: opacity;
`;

export const CopyToClipboard = () => {
  const { t } = useTranslation("form-builder");

  const [isCopied, setIsCopied] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const getSchema = useTemplateStore((s) => s.getSchema);

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = getSchema();

      await navigator.clipboard.writeText(stringified);
      setIsCopied(t("copyMessage"));
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 1500);
    }
  };

  return (
    <>
      <Button onClick={handleCopyToClipboard} theme="secondary">
        {t("copyButton")}
      </Button>
      {isCopied && <StyledSpan show={showMessage}>{isCopied}</StyledSpan>}
    </>
  );
};
