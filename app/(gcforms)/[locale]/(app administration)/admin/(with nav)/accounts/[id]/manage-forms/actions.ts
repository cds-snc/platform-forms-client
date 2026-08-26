"use server";

import { deleteTemplate } from "@lib/templates/mutations/deleteTemplate";
import { getFullTemplateByID } from "@lib/templates/queries/getFullTemplateByID";
import { TemplateHasUnprocessedSubmissions } from "@lib/templates/internal/errors";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";
import { getTemplateWithAssignedUsers } from "@lib/templates/queries/getTemplateWithAssignedUsers";
import { sendArchivedFormNotifications } from "@lib/formEmailOrchestration";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const deleteForm = AuthenticatedAction(async (session, id: string) => {
  try {
    const template = await getTemplateWithAssignedUsers(id);
    if (!template) {
      throw new Error(`Invalid form archive attempt for form ID: ${id}`);
    }

    await deleteTemplate(id);

    sendArchivedFormNotifications(session.user.email, {
      title: {
        en: template.formRecord.form.titleEn,
        fr: template.formRecord.form.titleFr,
      },
      ownersEmailAddresses: template.users.map((u) => u.email),
    });

    revalidatePath("app/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-forms");
  } catch (error) {
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Responses Exist");
    } else {
      throw new Error("Failed to Delete Form");
    }
  }
});

export const getFormJson = AuthenticatedAction(async (_, formId: string) => {
  try {
    const formRecord = await getFullTemplateByID(formId);

    if (!formRecord) {
      throw new Error("Form Not Found");
    }

    return { formRecord };
  } catch (e) {
    return { formRecord: null, error: (e as Error).message };
  }
});
