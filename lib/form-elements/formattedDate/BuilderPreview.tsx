"use client";
import React from "react";
import { DateFormat, DatePart } from "@clientComponents/forms/FormattedDate/types";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { cn } from "@lib/utils";

export const FormattedDateBuilderPreview = ({
  dateFormat = "YYYY-MM-DD",
  ...props
}: { dateFormat?: DateFormat } & React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation("common");

  const dateParts = dateFormat
    .split("-")
    .map((part: string) => {
      switch (part) {
        case "YYYY":
          return DatePart.YYYY;
        case "MM":
          return DatePart.MM;
        case "DD":
          return DatePart.DD;
        default:
          logMessage.info(`Unknown date part: ${JSON.stringify(part)}`);
          return;
      }
    })
    .filter((part): part is DatePart => typeof part !== "undefined");

  return (
    <div className="my-4 flex flex-row gap-2 text-lg opacity-65" {...props}>
      {dateParts.map((part) => {
        return (
          <div key={part}>
            {t(`formattedDate.${part}`)}
            <div
              className={cn(
                "gc-input-text mt-1 h-10 border-gray-400",
                part === DatePart.YYYY ? "w-28!" : "w-16!"
              )}
            ></div>
          </div>
        );
      })}
    </div>
  );
};
