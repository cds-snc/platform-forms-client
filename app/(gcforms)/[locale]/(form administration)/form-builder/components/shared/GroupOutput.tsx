"use client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const GroupOutput = () => {
  const getSchema = useTemplateStore((s) => s.getSchema);
  const schema = JSON.parse(getSchema());
  return (
    <details>
      <summary>Group JSON Schema</summary>
      <pre className="mt-5 overflow-scroll border-2 border-black/50 p-5">
        {JSON.stringify(schema.groups, null, 2)}
      </pre>
    </details>
  );
};
