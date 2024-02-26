"use client";
import React from "react";
import { useTemplateStore } from "@clientComponents/form-builder/store";

export const Output = () => {
  const getSchema = useTemplateStore((s) => s.getSchema);
  const stringified = getSchema();
  return <pre className="mt-5 overflow-scroll border-2 border-black/50 p-5">{stringified}</pre>;
};
