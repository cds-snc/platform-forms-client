"use server";
import { AuditLogDetails, logEvent, retrieveEvents } from "@lib/auditLogs";
import { prisma } from "@lib/integration/prismaConnector";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import {
  object,
  string,
  email,
  toLowerCase,
  trim,
  minLength,
  maxLength,
  safeParse,
  pipe,
} from "valibot";

export const getEventsForUser = async (userId: string) => {
  const {
    user: { id: callingUserId },
  } = await authorization.canViewAllUsers();
  const events = await retrieveEvents({
    TableName: "AuditLogs",
    IndexName: "UserByTime",
    Limit: 100,
    KeyConditionExpression: "UserID = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ScanIndexForward: false,
  });
  logEvent(
    callingUserId,
    { type: "User", id: userId },
    "AuditLogsRead",
    AuditLogDetails.UserAuditLogsRead,
    { callingUserId, userId }
  );
  return events;
};

export const getEventsForForm = async (formId: string) => {
  const {
    user: { id: callingUserId },
  } = await authorization.canViewAllForms();

  const events = await retrieveEvents({
    TableName: "AuditLogs",
    IndexName: "SubjectByTimestamp",
    Limit: 100,
    KeyConditionExpression: "Subject = :formId",
    ExpressionAttributeValues: {
      ":formId": `Form#${formId}`,
    },
    ScanIndexForward: false,
  });
  logEvent(
    callingUserId,
    { type: "Form", id: formId },
    "AuditLogsRead",
    AuditLogDetails.FormAuditLogsRead,
    { callingUserId, formId }
  );
  return events;
};

const emailSchema = object({
  subject: pipe(string(), email()),
});

const formSchema = object({
  subject: pipe(string(), minLength(1), maxLength(100), toLowerCase(), trim()),
});

export const findSubject = async (_: unknown, formData: FormData) => {
  authorization.hasAdministrationPrivileges().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(e.user.id, { type: "User" }, "AccessDenied", AuditLogDetails.GetAuditSubject, {
        subject: formData.get("subject") as string,
      });
    }
    throw e;
  });

  const subject = safeParse(formSchema, Object.fromEntries(formData.entries()), {
    abortPipeEarly: true,
  });

  if (!subject.success) {
    return {
      message: "Invalid Input",
      userId: "",
      formId: "",
      subject: "",
    };
  }

  // Is the input an email or a formId?
  const isEmail = safeParse(emailSchema, subject.output, { abortPipeEarly: true });

  if (isEmail.success) {
    const userId = await prisma.user.findFirst({
      where: {
        email: isEmail.output.subject,
      },
      select: { id: true },
    });
    if (!userId) {
      return {
        message: "User not found",
        userId: "",
        formId: "",
        subject: isEmail.output.subject,
      };
    }
    return {
      message: "",
      subject: isEmail.output.subject,
      userId: userId.id,
      formId: "",
    };
  } else {
    // Verify if formId is valid
    const isValid = await prisma.template.exists({
      id: subject.output.subject,
    });
    if (!isValid) {
      return {
        message: "Form Id not found",
        subject: subject.output.subject,
        userId: "",
        formId: "",
      };
    }
    return {
      message: "",
      subject: subject.output.subject,
      userId: "",
      formId: subject.output.subject,
    };
  }
};
