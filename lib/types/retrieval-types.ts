export interface BearerTokenPayload {
  formID: string;
}

export interface TemporaryTokenPayload {
  email: string;
  formID: string;
}

export type BearerResponse = {
  bearerToken: string;
};
