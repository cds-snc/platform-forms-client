import { useCallback } from "react";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

export const Menu = () => {
  const groups = useTemplateStore((s) => s.form.groups);
  const { setGroup, currentGroup } = useGCFormsContext();

  const setCurrentGroup = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
      const groupId = evt.currentTarget.dataset.id;
      if (groupId) {
        setGroup(groupId);
      }

      // Hide the popover
      const popoverEl = (evt.target as HTMLElement).closest("[popover]") as HTMLElement | null;
      if (
        popoverEl &&
        typeof (popoverEl as { hidePopover?: () => void }).hidePopover === "function"
      ) {
        (popoverEl as { hidePopover: () => void }).hidePopover();
      }
    },
    [setGroup]
  );

  if (!groups || Object.keys(groups).length === 0) {
    return null;
  }

  return (
    <div
      id="group-menu"
      popover="auto"
      className="min-w-[230px] rounded-lg border-1 border-slate-500 bg-white px-1.5 py-1 shadow-md"
      style={{
        // @ts-expect-error - CSS anchor positioning is not in the types yet
        positionArea: "center",
        positionAnchor: "--group-menu-trigger",
        top: "calc(anchor(top) - 250px)",
      }}
    >
      {Object.entries(groups).map(([groupId, group]) => {
        const isDisabled = groupId === currentGroup;
        return (
          <button
            disabled={isDisabled}
            key={groupId}
            type="button"
            className={`block w-full rounded-md p-2 text-left text-sm text-black !no-underline outline-none visited:text-black ${
              !isDisabled
                ? "hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
                : "cursor-not-allowed text-slate-400"
            }`}
            onClick={setCurrentGroup}
            data-id={groupId}
          >
            {group.name}
          </button>
        );
      })}
    </div>
  );
};
