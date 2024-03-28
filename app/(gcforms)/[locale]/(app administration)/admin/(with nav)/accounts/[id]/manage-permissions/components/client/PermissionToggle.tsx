import { useTransition } from "react";
import { ToggleLeft, ToggleRight } from "@serverComponents/icons";
import { PleaseHold } from "@serverComponents/globals/PleaseHold";

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
  const boldOn = on ? "font-bold" : "font-normal";
  const boldOff = !on ? "font-bold" : "font-normal";

  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => {
        startTransition(() => {
          handleToggle();
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          startTransition(() => {
            handleToggle();
          });
          // Stop the browser "space" key default behavior of scrolling down
          e.preventDefault();
        }
      }}
      className="flex items-center justify-between"
    >
      <p>{description}</p>
      <div className="cursor-pointer whitespace-nowrap">
        {isPending && <PleaseHold className="h-10 w-28" />}
        {!isPending && (
          <>
            <span id="switch-on" className={`mr-1 text-sm ${boldOff} mr-2`} aria-hidden="true">
              {offLabel}
            </span>
            {!on && <ToggleLeft className="inline-block w-12 fill-gray-light" />}
            {on && <ToggleRight className="inline-block w-12 fill-green" />}
            <span id="switch-off" className={`ml-1 text-sm ${boldOn} ml-2`} aria-hidden="true">
              {onLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
