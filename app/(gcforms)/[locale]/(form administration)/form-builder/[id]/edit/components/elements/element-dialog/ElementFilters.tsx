"use client";
import { Groups } from "@lib/hooks/form-builder/useElementOptions";
import { cn } from "@lib/utils";
import React, { useRef } from "react";
import { RovingTabIndexProvider, useFocusEffect, useRovingTabIndex } from "react-roving-tabindex";
import { SelectedGroupState } from "./ElementDialog";
import { useTranslation } from "@i18n/client";

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
        selected && "bg-blue-800 text-white",
        focused && "outline-1 outline-offset-4 outline-blue-focus"
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
  const { t } = useTranslation("form-builder");

  return (
    <div
      className="z-100 mt-4 flex gap-4"
      aria-label="Filter form elements by type:"
      data-testid="element-filters"
      role="radiogroup"
    >
      <RovingTabIndexProvider>
        <Pill selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} group="all">
          {t("addElementDialog.filters.all")}
        </Pill>
        {activeGroups.includes(Groups.BASIC) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.BASIC}
          >
            {t("addElementDialog.filters.basic")}
          </Pill>
        )}
        {activeGroups.includes(Groups.PRESET) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.PRESET}
          >
            {t("addElementDialog.filters.preset")}
          </Pill>
        )}
        {activeGroups.includes(Groups.OTHER) && (
          <Pill
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            group={Groups.OTHER}
          >
            {t("addElementDialog.filters.other")}
          </Pill>
        )}
      </RovingTabIndexProvider>
    </div>
  );
};
