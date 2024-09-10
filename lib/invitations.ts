import { Invitation } from "@prisma/client";
import { prisma } from "./integration/prismaConnector";
import { AccessControlError } from "./privileges";
import { getTemplateWithAssociatedUsers } from "./templates";
import { UserAbility } from "./types";
import { v4 as uuid } from "uuid";
import { logMessage } from "./logger";
import { getUser } from "./users";

const Roles = {
  OWNER: "owner",
  COLLABORATOR: "collaborator",
} as const;

export type UserRole = (typeof Roles)[keyof typeof Roles];

class TemplateNotFoundError extends Error {}
class UserAlreadyHasAccessError extends Error {}
class InvitationNotFoundError extends Error {}
class InvitationIsExpiredError extends Error {}

/**
 * Invite someone to the form by email
 *
 * @param ability
 * @param email
 * @param role
 * @param formId
 */
export const inviteUserByEmail = async (
  ability: UserAbility,
  email: string,
  role: UserRole = "owner",
  formId: string,
  message: string
) => {
  let template;
  let invitation;

  // Retrieve the template, fail if you don't have permissions
  try {
    template = await getTemplateWithAssociatedUsers(ability, formId);
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
      await _deleteInvitation(previousInvitation.id);
      invitation = await _createInvitation(email, formId, role);
    }

    // send invitation email
    await _sendInvitationEmail(invitation, message);
    return invitation;
  }

  // No previous invitation, create one
  invitation = await _createInvitation(email, formId, role);
  await _sendInvitationEmail(invitation, message);

  return invitation;
};

/**
 * Accept an invitation.
 * User has created their account or logged into their existing account.
 *
 * @param ability
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
  const now = new Date();
  if (invitation.expires < now) {
    throw new InvitationIsExpiredError();
  }

  // const user = await _findUserByEmail(invitation.email);
  const user = await getUser(ability, ability.userID);

  if (user) {
    // assign user to form
    await _assignUserToTemplate(user.id, invitation.templateId);
    await _deleteInvitation(invitationId);
    return true;
  }

  return false;
};

export const declineInvitation = async (ability: UserAbility, invitationId: string) => {
  const user = await getUser(ability, ability.userID);
  const invitation = await _retrieveFormInvitationByEmail(user.email, invitationId);

  if (invitation && user.email === invitation.email) {
    await _deleteInvitation(invitationId);
    return true;
  }

  throw new InvitationNotFoundError();
};

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
 * @param role
 * @returns
 */
const _createInvitation = async (email: string, formId: string, role: UserRole) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      templateId: formId,
      expires,
      role,
      token: uuid(),
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
const _sendInvitationEmail = async (invitation: Invitation, message: string) => {
  const { token, email, templateId } = invitation;

  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with token ${token} and message ${message}`
  );
};
