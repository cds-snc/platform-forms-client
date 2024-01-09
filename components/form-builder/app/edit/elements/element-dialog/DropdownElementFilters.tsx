import { Groups } from "@components/form-builder/hooks/useElementOptions";
import { CancelIcon, FilterIcon } from "@components/form-builder/icons";
import { cn } from "@lib/utils";
import React, { useState } from "react";

const Item = ({ children }: { children: React.ReactNode }) => {
  return <li className="cursor-pointer whitespace-nowrap p-2 hover:bg-gray-200">{children}</li>;
};

export const DropdownElementFilters = ({
  setSelectedGroups,
  selectedGroups,
}: {
  setSelectedGroups: React.Dispatch<React.SetStateAction<Groups[]>>;
  selectedGroups: Groups[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
    return (
      <div className="rounded-full border border-slate-800 bg-white px-4 py-2">
        {children}
        <button
          className="ml-2 inline-block"
          onClick={() => {
            setSelectedGroups(selectedGroups.filter((g) => g !== group));
          }}
        >
          <CancelIcon />
        </button>
      </div>
    );
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="z-100 mt-4 flex gap-4">
      <div className="relative">
        <button className="inline-block rounded-full bg-blue-800" onClick={() => toggleOpen()}>
          <FilterIcon className="scale-75 fill-white" />
        </button>
        {isOpen && (
          <div className="absolute mt-2 rounded-md border border-slate-900 bg-white">
            <ul className="list-none pl-0">
              <Item>Basic questions</Item>
              <Item>Preset questions</Item>
              <Item>Advanced questions</Item>
              <Item>Other elements</Item>
              <Item>Show all</Item>
            </ul>
          </div>
        )}
      </div>
      <Pill group="all">All</Pill>
      <Pill group={Groups.BASIC}>Basic</Pill>
      <Pill group={Groups.PRESET}>Preset</Pill>
      <Pill group={Groups.ADVANCED}>Advanced</Pill>
      <Pill group={Groups.OTHER}>Other</Pill>
    </div>
  );
};
