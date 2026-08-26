import { FormProperties } from "@lib/types";
import { youHaveBeenRemovedEmailTemplate } from "@lib/invitations/emailTemplates/youHaveBeenRemovedEmailTemplate";
import { ownerRemovedEmailTemplate } from "@lib/invitations/emailTemplates/ownerRemovedEmailTemplate";
import { ownerAddedEmailTemplate } from "@lib/invitations/emailTemplates/ownerAddedEmailTemplate";
import { sendDefaultEmail } from "@lib/integration/notifyConnector";

/**
 * Notify owners of ownership changes (owner removed)
 *
 * @param userToRemove User to be removed
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnerRemoved = async (
  userToRemove: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  // Send email to person who was removed
  const youHaveBeenRemovedEmailContent = youHaveBeenRemovedEmailTemplate(
    form.titleEn,
    form.titleFr
  );

  sendDefaultEmail({
    to: [userToRemove.email],
    subject: "Form access removed | Accès au formulaire supprimé",
    body: youHaveBeenRemovedEmailContent,
  });

  // Send email to remaining owners
  const ownerRemovedEmailContent = ownerRemovedEmailTemplate(
    form.titleEn,
    form.titleFr,
    userToRemove.name || "An owner"
  );

  sendDefaultEmail({
    to: users.map((u) => u.email),
    subject: "Form access removed | Accès au formulaire supprimé",
    body: ownerRemovedEmailContent,
  });
};

/**
 * Notify all owners when ownership changes (owner added)
 *
 * @param user New owner
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnerAdded = async (
  userToAdd: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  const emailContent = ownerAddedEmailTemplate(
    form.titleEn,
    form.titleFr,
    userToAdd.name || userToAdd.email
  );

  sendDefaultEmail({
    to: users.map((u) => u.email),
    subject: "Ownership change notification | Notification de changement de propriété",
    body: emailContent,
  });
};
