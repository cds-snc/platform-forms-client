import { UserAbility } from "@lib/types";
import { getUser } from "@lib/users";
import { TemplateNotFoundError, UserAlreadyHasAccessError, UserNotFoundError } from "./exceptions";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { AccessControlError } from "@lib/privileges";
import { prisma } from "@lib/integration/prismaConnector";
import { sendEmail } from "@lib/integration/notifyConnector";
import { inviteToCollaborate } from "@lib/invitations/emailTemplates/inviteToCollaborate";
import { inviteToForms } from "@lib/invitations/emailTemplates/inviteToForms";
import { getOrigin } from "@lib/origin";
import { logMessage } from "@lib/logger";
import { Invitation } from "@prisma/client";

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
      // check js dates vs prisma dates (see 2fa)
      _deleteInvitation(previousInvitation.id);
      invitation = await _createInvitation(email, formId);
    }

    // send or resend invitation email
    _sendInvitationEmail(sender, invitation, message, template.formRecord.name);
    return;
  }

  // No previous invitation, create one
  invitation = await _createInvitation(email, formId);
  _sendInvitationEmail(sender, invitation, message, template.formRecord.name);

  return;
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
    const formUrlEn = `${HOST}/en/form-builder/${invitation.templateId}`;
    const formUrlFr = `${HOST}/fr/form-builder/${invitation.templateId}`;

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
