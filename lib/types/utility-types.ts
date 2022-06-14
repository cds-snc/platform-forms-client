import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";

export interface LambdaResponse<T> {
  data: {
    records?: T[];
  };
}

export type UploadResult = {
  isValid: boolean;
  key: string;
};

export interface MiddlewareReturn {
  next: boolean;
  props?: MiddlewareProps;
}

export type MiddlewareRequest = (
  req: NextApiRequest,
  res: NextApiResponse,
  props?: Record<string, unknown>
) => Promise<MiddlewareReturn>;

export interface MiddlewareProps {
  formID?: string;
  session?: Session;
  email?: string;
  temporaryToken?: string;
}

export enum AdminLogAction {
  Create = "Create",
  Read = "Read",
  Update = "Update",
  Delete = "Delete",
}

export enum AdminLogEvent {
  GrantAdminRole = "GrantAdminRole",
  RevokeAdminRole = "RevokeAdminRole",
  UploadForm = "UploadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  RefreshBearerToken = "RefreshBearerToken",
  GrantInitialFormAccess = "GrantInitialFormAccess",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  EnableFeature = "EnableFeature",
  DisableFeature = "DisableFeature",
}

export type HTMLTextInputTypeAttribute =
  | "text"
  | "email"
  | "name"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "url";
