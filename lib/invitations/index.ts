import { Invitation } from "@prisma/client";
import { prisma } from "../integration/prismaConnector";
import { AccessControlError, checkPrivileges } from "../privileges";
import { UserAbility } from "../types";
import { logMessage } from "../logger";
import { sendEmail } from "../integration/notifyConnector";
import { getOrigin } from "../origin";
import { inviteToCollaborate } from "../emailTemplates/inviteToCollaborate";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  TemplateNotFoundError,
  UserAlreadyHasAccessError,
  UserNotFoundError,
} from "./exceptions";
import { inviteToForms } from "../emailTemplates/inviteToForms";
import { getUser } from "@lib/users";

/**
 * Invite someone to the form by email
 *
 * @param ability
 * @param email
 * @param formId
 */
export const inviteUserByEmail = async (
  ability: UserAbility,
  email: string,
  formId: string,
  message: string
) => {
  let template;
  let invitation;

  const sender = await getUser(ability, ability.userID);

  if (!sender) {
    throw new UserNotFoundError();
  }

  // Retrieve the template, fail if you don't have permissions
  try {
    template = await _getTemplateWithAssociatedUsers(ability, formId);
  } catch (e) {
    if (e instanceof AccessControlError) {
      throw e;
    }
  }

  if (!template) {
    throw new TemplateNotFoundError();
  }

  // check if user is already associated with the form
  if (template.users.some((user) => user.email === email)) {
    throw new UserAlreadyHasAccessError();
  }

  // check if user is already invited to the form
  const previousInvitation = await _retrieveFormInvitationByEmail(email, formId);
  if (previousInvitation) {
    invitation = previousInvitation;
    // if invitation is expired, delete and recreate
    if (previousInvitation.expires < new Date()) {
      // check js dates vs prisma dates (see 2fa)
      _deleteInvitation(previousInvitation.id);
      invitation = await _createInvitation(email, formId);
    }

    // send or resend invitation email
    _sendInvitationEmail(sender, invitation, message, template.name);
    return invitation;
  }

  // No previous invitation, create one
  invitation = await _createInvitation(email, formId);
  _sendInvitationEmail(sender, invitation, message, template.name);

  return invitation;
};

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
      _notifyOwnersOfNewOwnership();
      return true;
    }
  } catch (e) {
    // @TODO
  }

  throw new Error("User not found");
};

/**
 * Decline an invitation
 *
 * @param ability
 * @param invitationId
 * @returns
 */
export const declineInvitation = async (ability: UserAbility, invitationId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  const user = await getUser(ability, ability.userID);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if the user is the same as the one who received
  // the invitation. If so, delete the invitation
  if (user.email === invitation.email) {
    await _deleteInvitation(invitationId);
    return true;
  }

  throw new Error("Not your invitation");
};

/**
 * Cancel an invitation
 *
 * @param ability
 * @param invitationId
 */
export const cancelInvitation = async (ability: UserAbility, invitationId: string) => {
  // Retrieve the invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
    select: {
      email: true,
      templateId: true,
    },
  });

  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: { id: invitation.templateId } } },
  ]);

  // If no invitation found, return an error
  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  // Delete the invitation
  await _deleteInvitation(invitationId);
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
 * Retrieve existing invitation for a form by email
 *
 * @param email string
 * @param formId string
 * @returns Invitation
 */
const _retrieveFormInvitationByEmail = async (email: string, formId: string) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email,
      templateId: formId,
    },
  });

  return invitation;
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

/**
 * Create an invitation that expires in 7 days
 *
 * @param email
 * @param formId
 * @returns
 */
const _createInvitation = async (email: string, formId: string) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      templateId: formId,
      expires,
    },
  });

  return invitation;
};

/**
 * Send an invitation email
 *
 * @param invitation
 * @param message
 */
const _sendInvitationEmail = async (
  sender: { name: string | null; email: string },
  invitation: Invitation,
  message: string,
  templateName: string
) => {
  const { email, templateId } = invitation;

  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with message ${message}`
  );

  const HOST = getOrigin();

  // Determine whether to send an invitation to register or an invitation to the form
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  // User exists, send invitation to form
  if (user) {
    const formUrlEn = `${HOST}/en/form-builder/${invitation.templateId}/responses`;
    const formUrlFr = `${HOST}/fr/form-builder/${invitation.templateId}/responses`;

    const emailContent = inviteToCollaborate(
      sender.name || "",
      message,
      templateName,
      formUrlEn,
      formUrlFr
    );

    await sendEmail(email, {
      subject: "Invitation to collaborate on a form | Invitation à collaborer sur un formulaire",
      formResponse: emailContent,
    });

    return;
  }

  // User does not exist, send invitation to register
  const registerUrlEn = `${HOST}/en/auth/register`;
  const registerUrlFr = `${HOST}/fr/auth/register`;

  const emailContent = inviteToForms(sender.name || "", message, registerUrlEn, registerUrlFr);

  await sendEmail(email, {
    subject: "Invitation to create a GC Forms account | Invitation à créer un compte GC Forms",
    formResponse: emailContent,
  });
};

/**
 * Notify all owners when ownership changes
 */
const _notifyOwnersOfNewOwnership = async () => {
  //
};

const _getTemplateWithAssociatedUsers = async (ability: UserAbility, formId: string) => {
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
    throw new Error("Template not found");
  }

  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: { users: template.users } } },
  ]);

  return template;
};
