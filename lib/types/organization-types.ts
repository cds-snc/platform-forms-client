// CRUD Operations for Organizations
export type Organization = {
  organizationID: string;
  organizationNameEn?: string;
  organizationNameFr?: string;
};

export interface OrganizationLambdaInput {
  method: string;
  organizationID?: string; // UUID
  organizationNameEn?: string;
  organizationNameFr?: string;
}
