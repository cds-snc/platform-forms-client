import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { cn } from "@lib/utils";
import React, { useRef } from "react";

export const ElementFilters = ({
  setSelectedGroups,
  selectedGroups,
}: {
  setSelectedGroups: React.Dispatch<React.SetStateAction<Groups[]>>;
  selectedGroups: Groups[];
}) => {
  const updateSelectedGroups = (
    group: Groups | "all",
    pillRef: React.RefObject<HTMLButtonElement>
  ) => {
    if (group === "all") {
      setSelectedGroups([]);
    } else if (!selectedGroups.includes(group)) {
      setSelectedGroups([...selectedGroups, group]);
    } else if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter((g) => g !== group));
    }
    pillRef.current?.focus();
  };

  const Pill = ({ group, children }: { group: Groups | "all"; children: React.ReactNode }) => {
    let selected = false;

    const pillRef = useRef(null);

    if (group === "all") {
      selected = selectedGroups.length === 0;
    } else {
      selected = selectedGroups.includes(group);
    }

    return (
      <button
        ref={pillRef}
        className={cn(
          "rounded-full border border-slate-800 bg-white px-4 py-2",
          selected && "bg-blue-800 text-white"
        )}
        onClick={() => updateSelectedGroups(group, pillRef)}
        role="checkbox"
        aria-checked={selected}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="z-100 mt-4 flex gap-4" aria-label="Filter form elements by type:">
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
