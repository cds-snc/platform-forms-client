import React from "react";
import { useTranslation } from "next-i18next";

export const QuestionNumber = ({
  index,
  questionNumber,
}: {
  index: number;
  questionNumber: number | string;
}) => {
  const { t } = useTranslation("form-builder");

  return (
    <>
      <span
        className={`absolute left-0 bg-gray-default py-2.5 rounded-r ${
          index < 9 ? "px-1.5" : "pl-0.5 pr-1 tracking-tighter"
        }`}
      >
        {questionNumber}
      </span>
      <label
        className="mb-1 sr-only block font-[700] absolute w-px h-px p-0 -m-px overflow-hidden whitespace-no-wrap border-0"
        style={{ clip: "rect(0, 0, 0, 0)" }}
        htmlFor={`item${index}`}
      >
        {t("question")} {index + 1}
      </label>
    </>
  );
};
