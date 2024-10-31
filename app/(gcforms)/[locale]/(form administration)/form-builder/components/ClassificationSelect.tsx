"use client";
import React from "react";
import { cn } from "@lib/utils";
import { ProtectedIcon } from "@serverComponents/icons";

export const classificationOptions = [
  { value: "Unclassified", en: "UNCLASSIFIED", fr: "NON CLASSIFIÉ" },
  { value: "Protected A", en: "PROTECTED A", fr: "PROTÉGÉ A" },
  { value: "Protected B", en: "PROTECTED B", fr: "PROTÉGÉ B" },
] as const;

export type ClassificationType = (typeof classificationOptions)[number]["value"];
export interface ClassificationOption {
  value: ClassificationType;
  en: string;
  fr: string;
}

export interface ClassificationSelectProps {
  lang: "en" | "fr";
  isPublished: boolean;
  classification: ClassificationType;
  handleUpdateClassification: (classification: ClassificationType) => void;
  className?: string;
  disableProtectedB?: boolean;
  disabled?: boolean;
}

export const ClassificationSelect = ({
  lang,
  isPublished,
  classification,
  handleUpdateClassification,
  className,
  disableProtectedB,
  disabled,
  ...rest
}: ClassificationSelectProps) => {
  return (
    <div>
      <ProtectedIcon
        className={cn("mr-2 inline-block fill-black", disabled ? "fill-slate-400" : "")}
      />
      <select
        disabled={isPublished || disabled}
        id="classification-select"
        value={classification}
        className={cn(
          "form-builder-dropdown my-0 inline-block min-w-[200px] text-black-default",
          className,
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
          const val = evt.target.value;
          handleUpdateClassification(val as ClassificationType);
        }}
        {...rest}
      >
        {classificationOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.value === "Protected B" && disableProtectedB}
          >
            {option[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};
