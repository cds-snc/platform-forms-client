export interface BearerTokenPayload {
  formID: string;
}

export interface TemporaryTokenPayload {
  email: string;
}

export type BearerResponse = {
  bearerToken: string;
};
