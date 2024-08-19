"use client";
import { DateFormat, DatePart } from "@clientComponents/forms/FormattedDate/types";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import React from "react";

export const DateElement = ({
  dateFormat = "YYYY-MM-DD",
}: {
  dateFormat: DateFormat | undefined;
}) => {
  const { t } = useTranslation("common");

  const dateParts = dateFormat.split("-").map((part: string) => {
    switch (part) {
      case "YYYY":
        return DatePart.YYYY;
      case "MM":
        return DatePart.MM;
      case "DD":
        return DatePart.DD;
      default:
        throw new Error(`Unknown date part: ${part}`);
    }
  });

  return (
    <div className="my-4 flex flex-row gap-2 text-lg opacity-65">
      {dateParts.map((part) => {
        return (
          <div key={part}>
            {t(`formattedDate.${part}`)}
            <div
              className={cn(
                "gc-input-text mt-1 h-10 border-gray-400",
                part === DatePart.YYYY ? "w-28" : "w-16"
              )}
            ></div>
          </div>
        );
      })}
    </div>
  );
};
