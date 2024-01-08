import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { cn } from "@lib/utils";
import React from "react";

export const ElementFilters = ({
  setSelectedGroups,
  selectedGroups,
}: {
  setSelectedGroups: React.Dispatch<React.SetStateAction<Groups[]>>;
  selectedGroups: Groups[];
}) => {
  const updateSelectedGroups = (group: Groups | "all") => {
    if (group === "all") {
      setSelectedGroups([]);
      return;
    }
    if (!selectedGroups.includes(group)) {
      setSelectedGroups([...selectedGroups, group]);
      return;
    }

    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter((g) => g !== group));
      return;
    }
  };

  const Pill = ({ group, children }: { group: Groups | "all"; children: React.ReactNode }) => {
    let selected = false;

    if (group === "all") {
      selected = selectedGroups.length === 0;
    } else {
      selected = selectedGroups.includes(group);
    }

    return (
      <button
        className={cn(
          "rounded-full border border-slate-800 bg-white px-4 py-2",
          selected && "bg-blue-800 text-white"
        )}
        onClick={() => updateSelectedGroups(group)}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="z-100 mt-4 flex gap-4">
      {/* <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <span className="rounded-full bg-blue-800">
            <FilterIcon className="scale-75 fill-white" />
          </span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content side="bottom" sideOffset={15} align="start" className="">
            <DropdownMenu.Item className="">Basic</DropdownMenu.Item>

            <DropdownMenu.Item className="">Preset</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root> */}
      <Pill group="all">All</Pill>
      <Pill group={Groups.BASIC}>Basic</Pill>
      <Pill group={Groups.PRESET}>Preset</Pill>
      <Pill group={Groups.ADVANCED}>Advanced</Pill>
      <Pill group={Groups.OTHER}>Other</Pill>
    </div>
  );
};
