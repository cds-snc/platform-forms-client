import { FormRecord, UserAbility } from "@lib/types";
import { getUser } from "@lib/users";
import {
  InvalidDomainError,
  MismatchedEmailDomainError,
  TemplateNotFoundError,
  UserAlreadyHasAccessError,
  UserNotFoundError,
} from "./exceptions";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { prisma } from "@lib/integration/prismaConnector";
import { sendEmail } from "@lib/integration/notifyConnector";
import { inviteToCollaborateEmailTemplate } from "@lib/invitations/emailTemplates/inviteToCollaborateEmailTemplate";
import { inviteToFormsEmailTemplate } from "@lib/invitations/emailTemplates/inviteToFormsEmailTemplate";
import { getOrigin } from "@lib/origin";
import { logMessage } from "@lib/logger";
import { Invitation } from "@prisma/client";
import { logEvent } from "@lib/auditLogs";
import { isValidGovEmail } from "@lib/validation/validation";

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
  let invitation: Invitation;

  const sender = await getUser(ability, ability.user.id).catch(() => {
    throw new UserNotFoundError();
  });

  const template = await getTemplateWithAssociatedUsers(formId);

  if (!template) {
    throw new TemplateNotFoundError();
  }

  // check if user is already associated with the form
  if (template.users.some((user) => user.email === email)) {
    throw new UserAlreadyHasAccessError();
  }

  if (!isValidGovEmail(email)) {
    throw new InvalidDomainError();
  }

  // Check if the email domain matches the sender's email domain
  const senderDomain = sender.email.split("@")[1];
  const recipientDomain = email.split("@")[1];

  if (senderDomain !== recipientDomain) {
    throw new MismatchedEmailDomainError();
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
    _sendInvitationEmail(sender, invitation, message, template.formRecord);

    logEvent(
      ability.user.id,
      { type: "Form", id: invitation.templateId },
      "InvitationCreated",
      `${sender.id} invited ${invitation.email}`
    );

    return;
  }

  // No previous invitation, create one
  invitation = await _createInvitation(email, formId);
  _sendInvitationEmail(sender, invitation, message, template.formRecord);

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
  formRecord: FormRecord
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
    const formUrlEn = `${HOST}/en/forms`;
    const formUrlFr = `${HOST}/fr/forms`;

    const emailContent = inviteToCollaborateEmailTemplate(
      sender.name || "",
      message,
      formRecord.form.titleEn,
      formRecord.form.titleFr,
      formUrlEn,
      formUrlFr
    );

    await sendEmail(email, {
      subject: "Invitation to access form | Invitation pour accéder au formulaire",
      formResponse: emailContent,
    });

    return;
  }

  // User does not exist, send invitation to register
  const registerUrlEn = `${HOST}/en/auth/register`;
  const registerUrlFr = `${HOST}/fr/auth/register`;

  const emailContent = inviteToFormsEmailTemplate(
    sender.name || "",
    message,
    registerUrlEn,
    registerUrlFr
  );

  await sendEmail(email, {
    subject: "Invitation to access form | Invitation pour accéder au formulaire",
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
