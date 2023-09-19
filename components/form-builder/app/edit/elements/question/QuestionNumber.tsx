import React from "react";
import { useTranslation } from "next-i18next";
import { cn } from "@lib/utils";

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
        className={cn(
          "absolute left-0 rounded-r bg-slate-300 py-2.5",
          index < 9 ? "px-1.5" : "pl-0.5 pr-1 tracking-tighter"
        )}
      >
        {questionNumber}
      </span>
      <label
        className="sr-only absolute -m-px mb-1 block h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 font-[700]"
        style={{ clip: "rect(0, 0, 0, 0)" }}
        htmlFor={`item${index}`}
      >
        {t("question")} {index + 1}
      </label>
    </>
  );
};
