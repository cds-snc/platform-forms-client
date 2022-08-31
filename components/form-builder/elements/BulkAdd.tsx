import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { Choice } from "../types";
import useTemplateStore from "../store/useTemplateStore";

const LinkButton = styled.button`
  margin-top: 20px;
  margin-right: 20px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const TextInput = styled.textarea`
  margin: 20px 0 0 0;
  padding: 20px;
  width: 460px;
  height: 200px;
  font-size: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
`;

export const BulkAdd = ({
  index,
  choices,
  toggleBulkAdd,
}: {
  index: number;
  choices: Choice[];
  toggleBulkAdd: (onoff: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const { lang, bulkAddChoices } = useTemplateStore();
  const initialChoices = choices.map((choice) => choice[lang]).join("\n");
  const [textContent, setTextContent] = useState(initialChoices);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!e.target) {
      return;
    }
    setTextContent(e.target.value);
  }, []);

  return (
    <>
      <div>
        <TextInput onChange={handleChange}>{textContent}</TextInput>
      </div>

      <div>
        <LinkButton
          onClick={() => {
            bulkAddChoices(index, textContent);
            toggleBulkAdd(false);
          }}
        >
          {t("addOptions")}
        </LinkButton>
        <LinkButton
          onClick={() => {
            toggleBulkAdd(false);
          }}
        >
          {t("cancel")}
        </LinkButton>
      </div>
    </>
  );
};
