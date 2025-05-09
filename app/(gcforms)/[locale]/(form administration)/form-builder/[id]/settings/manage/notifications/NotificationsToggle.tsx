"use client";
import React from "react";
import { ToggleLeft, ToggleRight } from "@serverComponents/icons";

interface NotificationsToggleProps {
  isChecked: boolean;
  toggleChecked: () => void;
  onLabel: string;
  offLabel: string;
  tabIndex?: number;
  description?: string;
  disabled?: boolean;
}

export const NotificationsToggle = ({
  isChecked,
  toggleChecked,
  onLabel,
  offLabel,
  description,
  disabled,
}: NotificationsToggleProps) => {
  const boldOn = isChecked ? "font-bold" : "font-normal";
  const boldOff = !isChecked ? "font-bold" : "font-normal";

  return (
    <div
      className="inline-block"
      role="switch"
      aria-checked={isChecked}
      {...(disabled && { "aria-disabled": true })}
      tabIndex={0}
      onClick={() => {
        if (disabled) {
          return;
        }
        toggleChecked();
      }}
      onKeyDown={(e) => {
        if (disabled) {
          return;
        }
        if (e.key === "Enter" || e.key === " ") {
          // toggle the switch to the opposite state
          toggleChecked();
          // Stop the browser "space" key default behavior of scrolling down
          e.preventDefault();
        }
      }}
    >
      <div className={`whitespace-nowrap ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <span className="sr-only">{description && description}</span>
        <span
          id="notifications-switch-on"
          className={`mr-1 text-sm ${boldOff} mr-2`}
          aria-hidden="true"
        >
          {onLabel}
        </span>
        {!isChecked && <ToggleLeft className="inline-block w-12 fill-slate-500" />}
        {isChecked && <ToggleRight className="inline-block w-12 fill-emerald-500" />}
        <span
          id="notifications-switch-off"
          className={`ml-1 text-sm ${boldOn} ml-2`}
          aria-hidden="true"
        >
          {offLabel}
        </span>
      </div>
    </div>
  );
};
