import React from "react";
import { cn } from "@lib/utils";
import { ProtectedIcon } from "@formbuilder/icons";

const classificationOptions = [
  { value: "Unclassified", en: "Unclassified", fr: "Non classifié" },
  { value: "Protected A", en: "Protected A (default)", fr: "Protégé A (défaut)" },
  { value: "Protected B", en: "Protected B", fr: "Protégé B" },
] as const;

export type ClassificationType = (typeof classificationOptions)[number]["value"];

export interface ClassificationSelectProps {
  lang: "en" | "fr";
  isPublished: boolean;
  classification: ClassificationType;
  handleUpdateClassification: (classification: ClassificationType) => void;
  className?: string;
}

export const ClassificationSelect = ({
  lang,
  isPublished,
  classification,
  handleUpdateClassification,
  className,
  ...rest
}: ClassificationSelectProps) => {
  return (
    <div>
      <ProtectedIcon className="mr-2 inline-block" />
      <select
        disabled={isPublished}
        id="classification-select"
        value={classification}
        className={cn(
          "form-builder-dropdown my-0 inline-block min-w-[200px] text-black-default",
          className
        )}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
          const val = evt.target.value;
          handleUpdateClassification(val as ClassificationType);
        }}
        {...rest}
      >
        {classificationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};
