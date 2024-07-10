"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

export const GroupOutput = () => {
  const getSchema = useTemplateStore((s) => s.getSchema);
  const schema = JSON.parse(getSchema());
  const {
    formRecord: { id: formId },
    getValues,
    currentGroup,
    previousGroup,
    getGroupHistory,
  } = useGCFormsContext();
  const formValues = getValues();

  const groupLayoutNames = schema.groupLayout
    ? schema.groupLayout.map((id: string) => schema.groups[id]?.name)
    : [];

  return (
    <details>
      <summary>Group JSON Schema and Misc</summary>
      <pre className="mt-5 overflow-scroll border-2 border-black/50 p-5">
        Form Id = {formId}
        <br />
        Form Values = {JSON.stringify(formValues, null, 2)}
        <br />
        Current Group = {currentGroup}
        <br />
        Previous Group = {previousGroup}
        <br />
        Group Layout = {JSON.stringify(groupLayoutNames, null, 2)}
        <br />
        {JSON.stringify(schema.groupLayout, null, 2)}
        <br />
        Group History = {JSON.stringify(getGroupHistory(), null, 2)}
        <br />
        <br />
        {JSON.stringify(schema.groups, null, 2)}
      </pre>
    </details>
  );
};
