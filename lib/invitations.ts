import { Invitation } from "@prisma/client";
import { prisma } from "./integration/prismaConnector";
import { AccessControlError } from "./privileges";
import { getTemplateWithAssociatedUsers } from "./templates";
import { UserAbility } from "./types";
import { v4 as uuid } from "uuid";
import { getOrCreateUser } from "./users";

export const Roles = {
  OWNER: "owner",
  COLLABORATOR: "collaborator",
} as const;

type UserRoles = (typeof Roles)[keyof typeof Roles];

// const _retrieveInvitationsForForm = async (formId: string) => {
//   const invitations = await prisma.invitation.findMany({
//     where: {
//       templateId: formId,
//     },
//   });

//   return invitations;
// };

/**
 * Retrieve existing invitation for a form by email
 *
 * @param email string
 * @param formId string
 * @returns Invitation
 */
const _retrieveInvitationByEmail = async (email: string, formId: string) => {
  const invitation = await prisma.invitation.findFirst({
    where: {
      email,
      templateId: formId,
    },
  });

  return invitation;
};

const _deleteInvitation = async (id: string) => {
  await prisma.invitation.delete({
    where: {
      id,
    },
  });
};

const _createInvitation = async (email: string, formId: string, role: UserRoles) => {
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

const _sendInvitationEmail = async (invitation: Invitation, message: string) => {
  // const token = invitation.token;
  // const email = invitation.email;
  // const formId = invitation.templateId;
};

/**
 *
 * @param ability
 * @param email
 * @param role // for future use
 * @param formId
 */
export const inviteUserByEmail = async (
  ability: UserAbility,
  email: string,
  role: UserRoles = "owner",
  formId: string,
  message: string
) => {
  let template;
  let invitation;

  try {
    template = await getTemplateWithAssociatedUsers(ability, formId);
  } catch (e) {
    if (e instanceof AccessControlError) {
      // user cannot invite users to this form
    }
  }

  if (!template) {
    // template not found error
  }

  // check if user is already associated with the form
  if (template?.users.some((user) => user.email === email)) {
    // user is already associated with this form error
  }

  // check if user is already invited to the form
  const previousInvitation = await _retrieveInvitationByEmail(email, formId);

  if (previousInvitation) {
    // if invitation is expired, delete and recreate
    if (previousInvitation.expires < new Date()) {
      await _deleteInvitation(previousInvitation.id);
      invitation = await _createInvitation(email, formId, role);
    } else {
      invitation = previousInvitation;
    }

    // send invitation email
    await _sendInvitationEmail(invitation, message);
    return;
  }

  invitation = await _createInvitation(email, formId, role);
  await _sendInvitationEmail(invitation, message);
  return;
};

export const acceptInvitation = async (invitationId: string, name: string) => {
  // Retrieve the invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  // If no invitation found, return an error
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Check if the invitation has expired
  const now = new Date();
  if (invitation.expires < now) {
    throw new Error("Invitation has expired");
  }

  const user = await getOrCreateUser({
    email: invitation.email,
    name,
  });

  if (user) {
    // assign user to form
    await _assignUserToForm(user.id, invitation.templateId, invitation.role as UserRoles);
    await _deleteInvitation(invitationId);
  }
};

const _assignUserToForm = async (userId: string, formId: string, role: UserRoles) => {
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
