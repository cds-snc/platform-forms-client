import { useMemo } from "react";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { prepareTemplateForSave } from "@lib/utils/form-builder/prepareTemplateForSave";
import { getSchemaFromState } from "@lib/utils/form-builder";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { useTemplateStore } from "../useTemplateStore";

export const useTemplateValidationProblems = () => {
  const form = useTemplateStore((state) => state.form);
  const { validationFailure } = useTemplateContext();
  return useMemo(() => {
    const candidate = getSchemaFromState({ form });
    if (validationFailure?.schema === JSON.stringify(candidate, null, 2)) {
      return validationFailure.problems;
    }
    return validateTemplate(prepareTemplateForSave(candidate, { logFailure: false })).problems;
  }, [form, validationFailure]);
};
