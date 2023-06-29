import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "@components/form-builder/icons";

interface PermissionToggleProps {
  on: boolean;
  description: string;
  onLabel: string;
  offLabel: string;
  handleToggle: () => void;
  tabIndex?: number;
}

export const PermissionToggle = ({
  on,
  onLabel,
  offLabel,
  description,
  handleToggle,
}: PermissionToggleProps) => {
  const [isChecked, setIsChecked] = useState(on);
  const boldOn = on ? "font-bold" : "font-normal";
  const boldOff = !on ? "font-bold" : "font-normal";

  return (
    <div
      role="switch"
      aria-checked={isChecked}
      tabIndex={0}
      onClick={() => {
        handleToggle();
        setIsChecked(isChecked ? false : true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleToggle();
          // Stop the browser "space" key default behavior of scrolling down
          e.preventDefault();
          setIsChecked(isChecked ? false : true);
        }
      }}
      className="flex items-center justify-between"
    >
      <p>{description}</p>
      <div className="whitespace-nowrap cursor-pointer">
        <span id="switch-on" className={`text-sm mr-1 ${boldOff} mr-2`} aria-hidden="true">
          {offLabel}
        </span>
        {!on && <ToggleLeft className="inline-block w-12 fill-gray-light" />}
        {on && <ToggleRight className="inline-block w-12 fill-green" />}
        <span id="switch-off" className={`text-sm ml-1 ${boldOn} ml-2`} aria-hidden="true">
          {onLabel}
        </span>
      </div>
    </div>
  );
};
