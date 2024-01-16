import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { cn } from "@lib/utils";
import React, { useRef } from "react";
import { RovingTabIndexProvider, useFocusEffect, useRovingTabIndex } from "react-roving-tabindex";
import { SelectedGroupState } from "./ElementDialog";

const Pill = ({
  group,
  children,
  selectedGroup,
  setSelectedGroup,
}: {
  group: Groups | "all";
  children: React.ReactNode;
  selectedGroup: SelectedGroupState;
  setSelectedGroup: React.Dispatch<React.SetStateAction<SelectedGroupState>>;
}) => {
  const selected = group === selectedGroup.group;

  const ref = useRef<HTMLButtonElement>(null);
  const groupObj = { group, ref } as SelectedGroupState;

  const disabled = false;

  const [tabIndex, focused, handleKeyDown] = useRovingTabIndex(ref, disabled);

  useFocusEffect(focused, ref);

  const updateSelectedGroup = (group: SelectedGroupState) => {
    setSelectedGroup(group);
  };

  return (
    <button
      tabIndex={tabIndex}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onClick={() => updateSelectedGroup(groupObj)}
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
  selectedGroup: SelectedGroupState;
  setSelectedGroup: React.Dispatch<React.SetStateAction<SelectedGroupState>>;
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
