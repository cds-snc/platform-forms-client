import { useMemo } from "react";
import { getTemplateMigrationProblems } from "@lib/templates/schemaVersioning/getTemplateMigrationProblems";
import { useTemplateStore } from "../useTemplateStore";

export const useTemplateMigrationProblems = () => {
  const form = useTemplateStore((state) => state.form);
  return useMemo(() => getTemplateMigrationProblems(form), [form]);
};
