import { FormRecord, PublicFormRecord } from "@lib/types";

/*
 * Extract only the public properties from a form record.
 * The public properties are the ones that are needed to display the form
 * to unauthenticated users. (e.g. when filling out a form)
 * Also sets some of the default values for properties that are not set.
 * @param template A Form Record, containing all the properties
 * @returns a Public Form Record, with only the public properties
 */
export const mapTemplateToPublicFormRecord = (template: FormRecord): PublicFormRecord => {
  return {
    id: template.id,
    updatedAt: template.updatedAt,
    closingDate: template.closingDate,
    closedDetails: template.closedDetails,
    form: template.form,
    isPublished: template.isPublished,
    securityAttribute: template.securityAttribute,
    saveAndResume: template.saveAndResume,
  };
};
