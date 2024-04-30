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
  } = useGCFormsContext();
  const formValues = getValues();
  return (
    <details>
      <summary>Group JSON Schema and Misc</summary>
      <pre className="mt-5 overflow-scroll border-2 border-black/50 p-5">
        {JSON.stringify(schema.groups, null, 2)}
        Form Id = {formId}
        <br />
        Form Values = {JSON.stringify(formValues)}
        <br />
        Current Group = {currentGroup}
        <br />
        Previous Group = {previousGroup}
        Schema:
        <br />
        {JSON.stringify(schema.groups, null, 2)}
      </pre>
    </details>
  );
};
