import React, { useState, useCallback } from "react";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../../../store/useTemplateStore";
import { PropertyChoices } from "@lib/types";

export const BulkAdd = ({
  index,
  choices,
  toggleBulkAdd,
}: {
  index: number;
  choices: PropertyChoices[];
  toggleBulkAdd: (onoff: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const lang = useTemplateStore((s) => s.lang);
  const bulkAddChoices = useTemplateStore((s) => s.bulkAddChoices);
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
        <textarea onChange={handleChange}>{textContent}</textarea>
      </div>

      <div>
        <button
          onClick={() => {
            bulkAddChoices(index, textContent);
            toggleBulkAdd(false);
          }}
        >
          {t("addOptions")}
        </button>
        <button
          onClick={() => {
            toggleBulkAdd(false);
          }}
        >
          {t("cancel")}
        </button>
      </div>
    </>
  );
};
