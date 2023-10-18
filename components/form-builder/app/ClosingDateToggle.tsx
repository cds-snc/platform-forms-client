import React from "react";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

interface ClosingDateToggleProps {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  onLabel: string;
  offLabel: string;
  tabIndex?: number;
}

export const ClosingDateToggle = ({
  isChecked,
  setIsChecked,
  onLabel,
  offLabel,
}: ClosingDateToggleProps) => {
  const boldOn = isChecked ? "font-bold" : "font-normal";
  const boldOff = !isChecked ? "font-bold" : "font-normal";

  return (
    <div
      className="inline-block"
      role="switch"
      aria-checked={isChecked}
      tabIndex={0}
      onClick={() => {
        setIsChecked(isChecked ? true : false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          // toggle the switch to the opposite state
          setIsChecked(isChecked ? true : false);
          // Stop the browser "space" key default behavior of scrolling down
          e.preventDefault();
        }
      }}
    >
      <div className="cursor-pointer whitespace-nowrap">
        <span id="switch-on" className={`mr-1 text-sm ${boldOff} mr-2`} aria-hidden="true">
          {offLabel}
        </span>
        {!isChecked && <ToggleLeft className="inline-block w-12 fill-emerald-500" />}
        {isChecked && <ToggleRight className="inline-block w-12 fill-slate-500" />}
        <span id="switch-off" className={`ml-1 text-sm ${boldOn} ml-2`} aria-hidden="true">
          {onLabel}
        </span>
      </div>
    </div>
  );
};
