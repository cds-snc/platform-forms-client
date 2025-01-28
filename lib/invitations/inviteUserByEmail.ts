import { FormRecord } from "@lib/types";
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
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";

/**
 * Invite someone to the form by email
 *
 * @param email
 * @param formId
 */
export const inviteUserByEmail = async (email: string, formId: string, message: string) => {
  const { user } = await authorization.canEditForm(formId).catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Form", id: formId },
        "AccessDenied",
        `User ${e.user.id} does not have permission to invite user`
      );
    }
    throw e;
  });

  const sender = await getUser(user.id).catch(() => {
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
  const invitation = await _retrieveFormInvitationByEmail(email, formId)
    .then((previousInvitation) => {
      if (previousInvitation && previousInvitation.expires < new Date()) {
        _deleteInvitation(previousInvitation.id);
        return _createInvitation(email, formId, user.id);
      }
      if (previousInvitation === null) {
        return _createInvitation(email, formId, user.id);
      }
      return previousInvitation;
    })
    .catch((e) => {
      logMessage.info(e);
      throw new Error(
        `Unable to process inviting user ${email} for form ${formId} by ${user.email}`
      );
    });

  logEvent(
    user.id,
    { type: "Form", id: invitation.templateId },
    "InvitationCreated",
    `${user.email} invited ${invitation.email}`
  );

  await _sendInvitationEmail(sender, invitation, message, template.formRecord);

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
  const invitation = await prisma.invitation
    .findFirst({
      where: {
        email,
        templateId: formId,
      },
    })
    .catch((e) => {
      logMessage.info(e);
      throw new Error(`Error checking if invitation for email ${email} and form ${formId} exists`);
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
const _createInvitation = async (email: string, formId: string, senderUserId: string) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const invitation = await prisma.invitation
    .create({
      data: {
        email,
        templateId: formId,
        expires,
        invitedBy: senderUserId,
      },
    })
    .catch((e) => {
      logMessage.info(e);
      throw new Error(`Unable to create invitation for email ${email} and form ${formId}`);
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

  const HOST = await getOrigin();

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
  await prisma.invitation
    .delete({
      where: {
        id,
      },
    })
    .catch((e) => {
      logMessage.info(e);
      throw new Error(`Unable to delete invitation with id ${id}`);
    });
};
