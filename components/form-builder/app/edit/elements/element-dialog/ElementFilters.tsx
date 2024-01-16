import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { cn } from "@lib/utils";
import React, { useRef } from "react";
import { RovingTabIndexProvider, useFocusEffect, useRovingTabIndex } from "react-roving-tabindex";

const Pill = ({
  group,
  children,
  selectedGroup,
  setSelectedGroup,
}: {
  group: Groups | "all";
  children: React.ReactNode;
  selectedGroup: Groups | "all";
  setSelectedGroup: React.Dispatch<React.SetStateAction<Groups | "all">>;
}) => {
  const selected = group === selectedGroup;

  const ref = useRef<HTMLButtonElement>(null);

  const disabled = false;

  const [tabIndex, focused, handleKeyDown] = useRovingTabIndex(ref, disabled);

  useFocusEffect(focused, ref);

  const updateSelectedGroup = (group: Groups | "all") => {
    setSelectedGroup(group);
  };

  return (
    <button
      tabIndex={tabIndex}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onClick={() => updateSelectedGroup(group)}
      id={`${group}-filter`}
      ref={ref}
      className={cn(
        "rounded-full border border-slate-800 bg-white px-4 py-2",
        selected && "bg-blue-800 text-white"
      )}
      role="radio"
      aria-checked={selected}
      data-testid={`${group}-filter`}
    >
      {children}
    </button>
  );
};

export const ElementFilters = ({
  setSelectedGroup,
  selectedGroup,
  activeGroups,
}: {
  setSelectedGroup: React.Dispatch<React.SetStateAction<Groups | "all">>;
  selectedGroup: Groups | "all";
  activeGroups: Groups[];
}) => {
  return (
    <div
      className="z-100 mt-4 flex gap-4"
      aria-label="Filter form elements by type:"
      data-testid="element-filters"
      role="radiogroup"
    >
      <RovingTabIndexProvider>
        <Pill selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} group="all">
          All
        </Pill>
        {activeGroups.includes(Groups.BASIC) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.BASIC}
          >
            Basic <span className="visually-hidden">questions</span>
          </Pill>
        )}
        {activeGroups.includes(Groups.PRESET) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.PRESET}
          >
            Preset <span className="visually-hidden">questions</span>
          </Pill>
        )}
        {activeGroups.includes(Groups.ADVANCED) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.ADVANCED}
          >
            Advanced <span className="visually-hidden">questions</span>
          </Pill>
        )}
        {activeGroups.includes(Groups.OTHER) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.OTHER}
          >
            Other <span className="visually-hidden">elements</span>
          </Pill>
        )}
      </RovingTabIndexProvider>
    </div>
  );
};
