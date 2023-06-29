import React from "react";
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("form-builder");

  const boldOn = on ? "font-normal" : "font-light";
  const boldOff = !on ? "font-normal" : "font-light";

  return (
    <div className="flex items-baseline">
      <div
        role="button spinbutton"
        tabIndex={0}
        aria-activedescendant={on ? "switch-off" : "switch-on"}
        onClick={() => handleToggle()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggle();
          }
        }}
        className="whitespace-nowrap cursor-pointer"
      >
        <span
          id="switch-on"
          className={`text-sm mr-1 ${boldOn} mr-2`}
          aria-label={`${description} ${t("on")}`}
        >
          {onLabel}
        </span>
        {on && <ToggleLeft className="inline-block w-12 fill-[#95CCA2]" />}
        {!on && <ToggleRight className="inline-block w-12 fill-[#95CCA2]" />}
        <span
          id="switch-off"
          className={`text-sm ml-1 ${boldOff} ml-2`}
          aria-label={`${description} ${t("off")}`}
        >
          {offLabel}
        </span>
      </div>
    </div>
  );
};
