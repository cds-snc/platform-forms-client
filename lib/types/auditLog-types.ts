export enum AuditLogEvent {
  // Form Events
  CreateForm = "CreateForm",
  ReadForm = "ReadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  PublishForm = "PublishForm",
  ChangeDeliveryOption = "ChangeDeliveryOption",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  // User Events
  UserRegistration = "UserRegistration",
  UserSignIn = "UserSignIn",
  UserSignOut = "UserSignOut",
  UserPasswordReset = "UserPasswordReset",
  UserTooManyFailedAttempts = "UserTooManyFailedAttempts",
  GrantPrivilege = "GrantPrivilege",
  RevokePrivilege = "RevokePrivilege",
  // Application events
  EnableFeature = "EnableFeature",
  DisableFeature = "DisableFeature",
}
export type AuditLogEventStrings = keyof typeof AuditLogEvent;

enum AuditSubjectType {
  User = "User",
  Template = "Template",
  DeliveryOption = "DeliveryOption",
  Privilege = "Privilege",
  Flag = "Flag",
}

export type AuditSubject = { type: AuditSubjectType; id: string };
