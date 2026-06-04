import { FormProperties } from "@lib/types";
import { youHaveBeenRemovedEmailTemplate } from "../invitations/emailTemplates/youHaveBeenRemovedEmailTemplate";
import { ownerRemovedEmailTemplate } from "../invitations/emailTemplates/ownerRemovedEmailTemplate";
import { ownerAddedEmailTemplate } from "../invitations/emailTemplates/ownerAddedEmailTemplate";
import { sendEmail } from "../integration/notifyConnector";

/**
 * Notify owners of ownership changes (owner removed)
 *
 * @param userToRemove User to be removed
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerRemoved = async (
  userToRemove: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  // Send email to person who was removed
  const youHaveBeenRemovedEmailContent = youHaveBeenRemovedEmailTemplate(
    form.titleEn,
    form.titleFr
  );

  sendEmail(
    userToRemove.email,
    {
      subject: "Form access removed | Accès au formulaire supprimé",
      formResponse: youHaveBeenRemovedEmailContent,
    },
    "notifyRemovedOwner"
  );

  // Send email to remaining owners
  users.forEach((owner) => {
    const ownerRemovedEmailContent = ownerRemovedEmailTemplate(
      form.titleEn,
      form.titleFr,
      userToRemove.name || "An owner"
    );

    sendEmail(
      owner.email,
      {
        subject: "Form access removed | Accès au formulaire supprimé",
        formResponse: ownerRemovedEmailContent,
      },
      "notifyOtherOwnersOfRemovedOwner"
    );
  });
};

/**
 * Notify all owners when ownership changes (owner added)
 *
 * @param user New owner
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerAdded = async (
  userToAdd: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  const emailContent = ownerAddedEmailTemplate(
    form.titleEn,
    form.titleFr,
    userToAdd.name || userToAdd.email
  );

  users.forEach((owner) => {
    sendEmail(
      owner.email,
      {
        subject: "Ownership change notification | Notification de changement de propriété",
        formResponse: emailContent,
      },
      "notifyAddedOwner"
    );
  });
};
