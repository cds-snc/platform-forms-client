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
  res: NextApiResponse
) => Promise<MiddlewareReturn>;

export interface MiddlewareProps {
  formID?: string;
  session?: Session;
  email?: string;
  temporaryToken?: string;
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
