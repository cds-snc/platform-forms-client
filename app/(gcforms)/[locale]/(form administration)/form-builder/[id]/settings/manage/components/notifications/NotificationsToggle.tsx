import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "@serverComponents/icons";

interface NotificationsToggleProps {
  className?: string;
  userHasNotificationsEnabled: boolean;
  toggleChecked: (enabled: boolean) => Promise<void>;
  onLabel: string;
  offLabel: string;
  tabIndex?: number;
  description?: string;
}

export const NotificationsToggle = ({
  className = "",
  userHasNotificationsEnabled,
  toggleChecked,
  onLabel,
  offLabel,
  description,
}: NotificationsToggleProps) => {
  const [isChecked, setIsChecked] = useState(userHasNotificationsEnabled);

  const handleToggle = () => {
    setIsChecked(!isChecked);
    toggleChecked(!isChecked);
  };

  const boldOn = isChecked ? "font-bold" : "font-normal";
  const boldOff = !isChecked ? "font-bold" : "font-normal";

  return (
    <div
      className={className}
      role="switch"
      aria-checked={isChecked}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleToggle();
          e.preventDefault();
        }
      }}
    >
      <div className={`whitespace-nowrap`}>
        <span className="sr-only">{description}</span>
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
