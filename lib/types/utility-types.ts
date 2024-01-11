import { type NextRequest, NextResponse } from "next/server";
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
  props?: Record<string, unknown>;
  response?: NextResponse;
}

export type MiddlewareRequest = (
  req: NextRequest,
  reqBody: Record<string, unknown>
) => Promise<MiddlewareReturn>;

export interface MiddlewareProps {
  formID?: string;
  session?: Session;
  email?: string;
  temporaryToken?: string;
  context?: {
    params: Record<string, string | string[]>;
  };
  body: Record<string, unknown>;
}

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type HTMLTextInputTypeAttribute =
  | "text"
  | "email"
  | "name"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "url";
