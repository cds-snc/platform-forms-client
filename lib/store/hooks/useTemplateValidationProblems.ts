import { useMemo } from "react";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { useTemplateStore } from "../useTemplateStore";

export const useTemplateValidationProblems = () => {
  const form = useTemplateStore((state) => state.form);
  return useMemo(() => validateTemplate(structuredClone(form)).problems, [form]);
};
