"use server";

import { deleteTemplate } from "@lib/templates";
import { TemplateHasUnprocessedSubmissions } from "@lib/templates";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";
import { getPublicTemplateByID } from "@lib/templates";
import { sendArchivedFormNotifications } from "@lib/notifications";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const deleteForm = AuthenticatedAction(async (session, id: string) => {
  try {
    const template = await getPublicTemplateByID(id);
    if (!template) {
      throw new Error(`Invalid form archive attempt for form ID: ${id}`);
    }

    await deleteTemplate(id);
    await sendArchivedFormNotifications(session, id, template.form.titleEn, template.form.titleFr);

    revalidatePath("app/[locale]/(app administration)/admin/(with nav)/accounts/[id]/manage-forms");
  } catch (error) {
    if (error instanceof TemplateHasUnprocessedSubmissions) {
      throw new Error("Responses Exist");
    } else {
      throw new Error("Failed to Delete Form");
    }
  }
});
