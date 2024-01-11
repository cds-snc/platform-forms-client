import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { cn } from "@lib/utils";
import React, { useRef } from "react";

export const ElementFilters = ({
  setSelectedGroup,
  selectedGroup,
}: {
  setSelectedGroup: React.Dispatch<React.SetStateAction<Groups | "all">>;
  selectedGroup: Groups | "all";
}) => {
  const Pill = ({ group, children }: { group: Groups | "all"; children: React.ReactNode }) => {
    const selected = group === selectedGroup;

    const buttonRef = useRef<HTMLButtonElement>(null);

    const updateSelectedGroup = (group: Groups | "all") => {
      setSelectedGroup(group);
      buttonRef.current?.focus();
    };

    return (
      <button
        ref={buttonRef}
        className={cn(
          "rounded-full border border-slate-800 bg-white px-4 py-2",
          selected && "bg-blue-800 text-white"
        )}
        onClick={() => updateSelectedGroup(group)}
        role="radio"
        aria-checked={selected}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      className="z-100 mt-4 flex gap-4"
      aria-label="Filter form elements by type:"
      data-testid="element-filters"
    >
      <Pill group="all">All</Pill>
      <Pill group={Groups.BASIC}>
        Basic <span className="visually-hidden">questions</span>
      </Pill>
      <Pill group={Groups.PRESET}>
        Preset <span className="visually-hidden">questions</span>
      </Pill>
      <Pill group={Groups.ADVANCED}>
        Advanced <span className="visually-hidden">questions</span>
      </Pill>
      <Pill group={Groups.OTHER}>
        Other <span className="visually-hidden">elements</span>
      </Pill>
    </div>
  );
};
