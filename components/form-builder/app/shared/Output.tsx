import React from "react";
import { useTemplateStore } from "../../store";

export const Output = () => {
  const getSchema = useTemplateStore((s) => s.getSchema);
  const stringified = getSchema();
  return <pre className="mt-5 p-5 border-2 border-black/50 overflow-scroll">{stringified}</pre>;
};
