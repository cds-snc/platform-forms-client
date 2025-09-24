import { FormProperties } from "@gcforms/types";

/**
 * Cleans the groupsLayout of the formConfig by removing "start" and "end" markers.
 * @param formConfig The form configuration to clean.
 * @returns The cleaned form configuration.
 */
export const cleanGroupsLayout = (formConfig: FormProperties): FormProperties => {
  if (formConfig.groupsLayout) {
    formConfig.groupsLayout = formConfig.groupsLayout.filter(
      (id) => id !== "start" && id !== "end"
    );
  }
  return formConfig;
};
