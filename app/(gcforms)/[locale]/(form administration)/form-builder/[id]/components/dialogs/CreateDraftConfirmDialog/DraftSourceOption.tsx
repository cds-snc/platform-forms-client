"use client";

import Image from "next/image";
import React, { type ReactNode } from "react";

export type DraftSource = "current" | "previous" | "upload";

type Props = {
  value: DraftSource;
  title: string;
  description?: string;
  icon: ReactNode;
  isSelected: boolean;
  selectedLabel: string;
  onSelect: () => void;
  children?: ReactNode;
};

export const DraftSourceOption = ({
  value,
  title,
  description,
  icon,
  isSelected,
  selectedLabel,
  onSelect,
  children,
}: Props) => (
  <label
    className={`mr-4 cursor-pointer rounded-md border-2 p-6 transition-all ${
      isSelected ? "border-gcds-blue-vivid bg-blue-50" : "border-gray-300 hover:border-gray-400"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className={isSelected ? "text-gcds-blue-vivid" : "text-slate-600"}>{icon}</span>
        <div>
          <div className="font-bold text-slate-900">{title}</div>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      <input
        type="radio"
        name="draft-source"
        value={value}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />
      {isSelected && (
        <Image
          src="/img/check_24px.png"
          alt={selectedLabel}
          width={24}
          height={24}
          className="shrink-0"
        />
      )}
    </div>
    {children}
  </label>
);
