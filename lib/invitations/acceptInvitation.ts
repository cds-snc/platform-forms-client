import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  TemplateNotFoundError,
  UserNotFoundError,
} from "./exceptions";
import { checkPrivileges } from "@lib/privileges";
import { ownerAddedNotification } from "@lib/invitations/emailTemplates/ownerAddedNotification";
import { sendEmail } from "@lib/integration/notifyConnector";

/**
 * Accept an invitation.
 * User has created their account or logged into their existing account.
 *
 * @param ability (logged in user)
 * @param invitationId
 * @returns
 */
export const acceptInvitation = async (ability: UserAbility, invitationId: string) => {
  // Retrieve the invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  // If no invitation found, return an error
  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  // Check if the invitation has expired
  const now = new Date(); // check these dates
  if (invitation.expires < now) {
    throw new InvitationIsExpiredError();
  }

  try {
    checkPrivileges(ability, [
      { action: "view", subject: { type: "User", object: { id: ability.userID } } },
    ]);

    const user = await prisma.user.findFirst({
      where: {
        email: invitation.email,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      // assign user to form
      await _assignUserToTemplate(user.id, invitation.templateId);
      _deleteInvitation(invitationId);
      _notifyOwnersOfNewOwnership(user.id, invitation.templateId);
      return true;
    }
  } catch (e) {
    // @TODO
  }

  throw new UserNotFoundError();
};

/**
 * Assign user to template
 *
 * @param userId
 * @param formId
 */
const _assignUserToTemplate = async (userId: string, formId: string) => {
  await prisma.template.update({
    where: {
      id: formId,
    },
    data: {
      users: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

/**
 * Notify all owners when ownership changes
 */
const _notifyOwnersOfNewOwnership = async (userId: string, formId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const template = await prisma.template.findFirst({
    where: {
      id: formId,
    },
    select: {
      id: true,
      name: true,
      users: true,
    },
  });

  if (!template) {
    throw new TemplateNotFoundError();
  }

  const emailContent = ownerAddedNotification(template?.name, user.name || user.email);

  template.users.forEach((owner) => {
    sendEmail(owner.email, {
      subject: "Ownership change notification | Notification de changement de propriété",
      formResponse: emailContent,
    });
  });
};

/**
 * Delete an invitation
 *
 * @param id
 */
const _deleteInvitation = async (id: string) => {
  await prisma.invitation.delete({
    where: {
      id,
    },
  });
};
